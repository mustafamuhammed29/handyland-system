import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CLOUD_NAME = 'xd8hhdh0';
const UPLOAD_PRESET = 'handyland_unsigned';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

const OLD_DATA_DIR = path.join(process.cwd(), 'old_data');

async function uploadToCloudinary(base64String) {
  if (!base64String || (!base64String.startsWith('data:image') && !base64String.startsWith('data:video'))) {
    return base64String;
  }
  try {
    const formData = new FormData();
    formData.append('file', base64String);
    formData.append('upload_preset', UPLOAD_PRESET);

    const res = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData
    });
    
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Cloudinary error: ${errText}`);
    }

    const data = await res.json();
    return data.secure_url;
  } catch (err) {
    console.error('Failed to upload image to Cloudinary', err);
    return base64String; // fallback to original if upload fails
  }
}

async function processFile(filePath, tableName) {
  console.log(`\n--- Processing table: ${tableName} ---`);
  const rows = [];
  
  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => rows.push(data))
      .on('end', () => resolve())
      .on('error', (err) => reject(err));
  });

  console.log(`Found ${rows.length} rows in ${tableName}`);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    console.log(`Row ${i + 1}/${rows.length}: Checking for Base64 media...`);

    const imageFields = ['imageData', 'logoData', 'faviconData'];
    
    for (const field of imageFields) {
      if (row[field] && (row[field].startsWith('data:image') || row[field].startsWith('data:video'))) {
        console.log(` - Uploading ${field}...`);
        const url = await uploadToCloudinary(row[field]);
        row[field] = url;
      }
    }
  }

  // Remove empty strings for fields that expect JSON or numbers
  const cleanedRows = rows.map(row => {
    const newRow = { ...row };
    // Handle empty strings where not appropriate based on common Supabase structures
    Object.keys(newRow).forEach(key => {
      if (newRow[key] === '') {
        newRow[key] = null;
      }
    });
    
    // For ingredients JSONB
    if (newRow.ingredients) {
      try {
        newRow.ingredients = JSON.parse(newRow.ingredients);
      } catch(e) {
        newRow.ingredients = [];
      }
    }

    return newRow;
  });

  if (cleanedRows.length > 0) {
    console.log(`Inserting ${cleanedRows.length} rows into Supabase table: ${tableName}...`);
    // Delete existing rows first to avoid ID conflict
    // await supabase.from(tableName).delete().neq('id', '00000000-0000-0000-0000-000000000000'); 
    
    const { data, error } = await supabase.from(tableName).upsert(cleanedRows);
    if (error) {
      console.error(`Error inserting into ${tableName}:`, error.message);
    } else {
      console.log(`✅ Successfully migrated ${tableName}`);
    }
  } else {
    console.log(`No rows to insert for ${tableName}`);
  }
}

async function runMigration() {
  if (!fs.existsSync(OLD_DATA_DIR)) {
    console.error('old_data directory not found!');
    process.exit(1);
  }

  const files = fs.readdirSync(OLD_DATA_DIR).filter(f => f.endsWith('.csv'));
  
  if (files.length === 0) {
    console.log('No CSV files found in old_data.');
    return;
  }

  for (const file of files) {
    const filePath = path.join(OLD_DATA_DIR, file);
    const tableName = file.replace('_rows.csv', '');
    await processFile(filePath, tableName);
  }

  console.log('\n🎉 All migrations completed successfully!');
}

runMigration();

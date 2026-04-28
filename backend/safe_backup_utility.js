import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backup = async () => {
    const sourceDir = path.join(__dirname, 'db_data_fresh');
    const backupDir = path.join(__dirname, 'backups_filesystem');
    
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const destDir = path.join(backupDir, `sector_snapshot_${timestamp}`);

    try {
        console.log("Initiating Master Snaphot (Filesystem Level)...");
        
        if (!fs.existsSync(sourceDir)) {
            console.error("ERROR: Source sector 'db_data_fresh' not found.");
            return;
        }

        // We use fs-extra to copy the directory even if there are temp locks
        await fs.copy(sourceDir, destDir);
        
        console.log(`\n✅ SNAPSHOT SECURED: ${destDir}`);
        console.log(`Your mission data is now safe for off-site storage.`);
    } catch (err) {
        console.error("Critical Failure during safe snapshot:", err.message);
    }
};

backup();

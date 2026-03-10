// JsonCrudAPI - Express.js Server for JSON CRUD Operations
import express from 'express';
import cors from 'cors';

// Import MCP CRUD functions
import { 
    readJSON, 
    writeJSON, 
    updateJSON, 
    deleteJSON, 
    listJSONFiles, 
    fileExists 
} from '../mcp-server/src/utils/fileOperations.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: "JSON CRUD API is running",
        timestamp: new Date().toISOString()
    });
});

// CREATE/WRITE - Write JSON file
app.post('/api/write-json', async (req, res) => {
    try {
        const { filepath, data } = req.body;
        
        if (!filepath || !data) {
            return res.status(400).json({ 
                success: false, 
                error: 'filepath and data are required' 
            });
        }

        const result = await writeJSON(filepath, data);
        res.json({ 
            success: true, 
            message: `File ${filepath} created successfully`,
            ...result 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// READ - Read JSON file
app.get('/api/read-json/:filepath', async (req, res) => {
    try {
        const filepath = req.params.filepath;
        
        if (!filepath) {
            return res.status(400).json({ 
                success: false, 
                error: 'filepath is required' 
            });
        }

        const data = await readJSON(filepath);
        res.json({ 
            success: true, 
            filepath: filepath,
            data: data 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// UPDATE - Update JSON file (merge with existing)
app.patch('/api/update-json', async (req, res) => {
    try {
        const { filepath, updates } = req.body;
        
        if (!filepath || !updates) {
            return res.status(400).json({ 
                success: false, 
                error: 'filepath and updates are required' 
            });
        }

        const result = await updateJSON(filepath, updates);
        res.json({ 
            success: true,
            message: `File ${filepath} updated successfully`,
            ...result 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// DELETE - Delete JSON file
app.delete('/api/delete-json/:filepath', async (req, res) => {
    try {
        const filepath = req.params.filepath;
        
        if (!filepath) {
            return res.status(400).json({ 
                success: false, 
                error: 'filepath is required' 
            });
        }

        const result = await deleteJSON(filepath);
        res.json({ 
            success: true,
            message: `File ${filepath} deleted successfully`,
            ...result 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// LIST - List all JSON files in directory
app.get('/api/list-json', async (req, res) => {
    try {
        const directory = req.query.directory || '.';
        const files = await listJSONFiles(directory);
        res.json({ 
            success: true, 
            directory: directory,
            files: files 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// CHECK - Check if file exists
app.get('/api/check-exists/:filepath', async (req, res) => {
    try {
        const filepath = req.params.filepath;
        
        if (!filepath) {
            return res.status(400).json({ 
                success: false, 
                error: 'filepath is required' 
            });
        }

        const exists = await fileExists(filepath);
        res.json({ 
            success: true, 
            filepath: filepath,
            exists: exists 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// DATA_OPERATION handler function - uses existing CRUD functions with generic table support
async function handleDataOperation(action, table, data) {
  const filepath = `${table}.json`;
  
  try {
    // Check if file exists first (for read operations)
    if (action === 'read') {
      const exists = await fileExists(filepath);
      if (!exists) {
        return {
          success: false,
          error: `Table '${table}' not found. File ${filepath} does not exist.`,
          table: table,
          fileNotFound: true
        };
      }
      
      const result = await readJSON(filepath);
      return {
        success: true,
        data: result,
        table: table
      };
    }
    
    if (action === 'write') {
      await writeJSON(filepath, data);
      return {
        success: true,
        message: `${table}.json written successfully`,
        table: table
      };
    }
    
    if (action === 'update') {
      const exists = await fileExists(filepath);
      if (!exists) {
        return {
          success: false,
          error: `Table '${table}' not found. Cannot update non-existent file.`,
          table: table,
          fileNotFound: true
        };
      }
      
      await updateJSON(filepath, data);
      return {
        success: true,
        message: `${table}.json updated successfully`,
        table: table
      };
    }
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      table: table
    };
  }
}

// DATA_OPERATION endpoint
app.post('/api/data-operation', async (req, res) => {
  const { action, table, data } = req.body;
  
  try {
    const result = await handleDataOperation(action, table, data);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 JSON CRUD API Server running on http://localhost:${PORT}`);
    console.log(`📁 Data directory: mcp-server/data/`);
    console.log(`\n📋 Available endpoints:`);
    console.log(`  GET    /health - Health check`);
    console.log(`  POST   /api/write-json - Create/overwrite JSON file`);
    console.log(`  GET    /api/read-json/:filepath - Read JSON file`);
    console.log(`  PATCH  /api/update-json - Update JSON file`);
    console.log(`  DELETE /api/delete-json/:filepath - Delete JSON file`);
    console.log(`  GET    /api/list-json - List all JSON files`);
    console.log(`  GET    /api/check-exists/:filepath - Check if file exists`);
    console.log(`  POST   /api/data-operation - Generic data operation (NEW!)`);
});

export default app;
import * as fs from 'node:fs';
import * as path from 'node:path';
import { createServer } from "./create-server.ts";
import {cleanupFile, downloadAudio, generateFilename} from "./helpers.ts";

interface DownloadResponse {
    success: boolean;
    message?: string;
    filename?: string;
}

const app = createServer();

app.post('/download-mp3', async (req, res) => {
    try {
        const requestBody = req.body;

        if (!Array.isArray(requestBody) || requestBody.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Request body must be a non-empty array'
            });
        }

        const results: DownloadResponse[] = [];

        for (const item of requestBody) {
            try {
                if (!item.url || typeof item.url !== 'string') {
                    results.push({
                        success: false,
                        message: 'URL is required and must be a string'
                    });
                    continue;
                }

                const filename = generateFilename('audio', 'mp3');
                await downloadAudio(item.url, filename);

                results.push({
                    success: true,
                    filename: filename
                });

            } catch (error) {
                console.log(error);
                results.push({
                    success: false,
                    message: error instanceof Error ? error.message : 'Unknown error occurred'
                });
            }
        }

        res.json(results);

    } catch (error) {
        console.error('MP3 download error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

app.get('/file/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filepath = path.resolve(filename);

        if (!fs.existsSync(filepath)) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        res.download(filepath, (err) => {
            if (err) {
                console.error('File download error:', err);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: 'Error downloading file'
                    });
                }
            } else {
                setTimeout(() => cleanupFile(filepath), 1000);
            }
        });

    } catch (error) {
        console.error('File serving error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

process.on('SIGINT', () => {
    console.log('Shutting down server...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Shutting down server...');
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
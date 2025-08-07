import * as fs from "node:fs";
import {pipeline} from "node:stream";
import {promisify} from "node:util";
import ytdownloader from '@distube/ytdl-core'

const pipelineAsync = promisify(pipeline);

export const generateFilename = (prefix: string, extension: string): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${random}.${extension}`;
};

export const cleanupFile = async (filepath: string): Promise<void> => {
    try {
        await fs.promises.unlink(filepath);
    } catch (error) {
        console.error('Cleanup error:', error);
    }
};

export const downloadAudio = async (url: string, filename: string): Promise<void> => {
    try {
        await ytdownloader.getInfo(url);
    } catch (error) {
        throw new Error('Invalid YouTube URL or video not accessible');
    }

    const options: ytdownloader.downloadOptions = {
        quality: 'highestaudio',
        filter: 'audioonly',
    };

    console.log(`Downloading audio from ${url} to ${filename}`);

    const stream = ytdownloader(url, options);
    const writeStream = fs.createWriteStream(filename);

    try {
        await pipelineAsync(stream, writeStream);
        console.log(`Successfully downloaded: ${filename}`);
    } catch (error) {
        try {
            await fs.promises.unlink(filename);
        } catch (unlinkError) {
            console.error('Failed to cleanup incomplete file:', unlinkError);
        }
        throw new Error(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
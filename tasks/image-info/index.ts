import type { Context } from "@oomol/types/oocana";
import sharp from "sharp";
import fs from "fs";

//#region generated meta
type Inputs = {
    image_path: string;
};
type Outputs = {
    width: number;
    height: number;
    channels: number;
    format: string;
    size: number;
    info: object;
};
//#endregion

export default async function(
    params: Inputs, 
    context: Context<Inputs, Outputs>
): Promise<Outputs> {
    try {
        const inputPath = params.image_path;
        
        if (!fs.existsSync(inputPath)) {
            throw new Error(`Input file does not exist: ${inputPath}`);
        }
        
        // Get file size
        const stats = fs.statSync(inputPath);
        const fileSize = stats.size;
        
        // Get image metadata using Sharp
        const image = sharp(inputPath);
        const metadata = await image.metadata();
        
        if (!metadata.width || !metadata.height) {
            throw new Error("Unable to get image dimensions");
        }
        
        return {
            width: metadata.width,
            height: metadata.height,
            channels: metadata.channels || 3,
            format: metadata.format || "unknown",
            size: fileSize,
            info: {
                width: metadata.width,
                height: metadata.height,
                channels: metadata.channels,
                format: metadata.format,
                space: metadata.space,
                depth: metadata.depth,
                density: metadata.density,
                chromaSubsampling: metadata.chromaSubsampling,
                isProgressive: metadata.isProgressive,
                hasProfile: metadata.hasProfile,
                hasAlpha: metadata.hasAlpha,
                orientation: metadata.orientation,
                size: fileSize
            }
        };
    } catch (error) {
        throw new Error(`Failed to get image information: ${error.message}`);
    }
}
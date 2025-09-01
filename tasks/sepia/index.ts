import type { Context } from "@oomol/types/oocana";
import sharp from "sharp";
import path from "path";
import fs from "fs";

//#region generated meta
type Inputs = {
    image_path: string;
};
type Outputs = {
    image_path: string;
};
//#endregion

export default async function(
    params: Inputs, 
    context: Context<Inputs, Outputs>
): Promise<Outputs> {
    try {
        const inputPath = params.image_path;
        
        if (!fs.existsSync(inputPath)) {
            throw new Error(`输入文件不存在: ${inputPath}`);
        }
        
        const outputDir = "/oomol-driver/oomol-storage";
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const ext = path.extname(inputPath);
        const outputPath = path.join(outputDir, `sepia_${Date.now()}${ext}`);
        
        await sharp(inputPath)
            .tint({ r: 255, g: 240, b: 196 })
            .modulate({ saturation: 0.8 })
            .toFile(outputPath);
        
        return { image_path: outputPath };
    } catch (error) {
        throw new Error(`复古褐色调处理失败: ${error.message}`);
    }
}
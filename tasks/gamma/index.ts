import type { Context } from "@oomol/types/oocana";
import sharp from "sharp";
import path from "path";
import fs from "fs";

//#region generated meta
type Inputs = {
    image_path: string;
    gamma: number;
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
        const inputPath = params.file_path;
        const gammaValue = params.gamma;
        
        if (!fs.existsSync(inputPath)) {
            throw new Error(`输入文件不存在: ${inputPath}`);
        }
        
        const outputDir = "/oomol-driver/oomol-storage";
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const ext = path.extname(inputPath);
        const outputPath = path.join(outputDir, `gamma_${Date.now()}${ext}`);
        
        await sharp(inputPath)
            .gamma(gammaValue)
            .toFile(outputPath);
        
        return { output_image: outputPath };
    } catch (error) {
        throw new Error(`图片伽马调整失败: ${error.message}`);
    }
}
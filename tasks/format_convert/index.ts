import type { Context } from "@oomol/types/oocana";
import sharp from "sharp";
import path from "path";
import fs from "fs";

//#region generated meta
type Inputs = {
    image_path: string;
    output_format: "jpeg" | "png" | "webp" | "avif" | "tiff" | "gif" | "bmp";
    quality: number;
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
        const { output_format, quality } = params;
        
        if (!fs.existsSync(inputPath)) {
            throw new Error(`输入文件不存在: ${inputPath}`);
        }
        
        const outputDir = "/oomol-driver/oomol-storage";
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const outputPath = path.join(outputDir, `converted_${Date.now()}.${output_format}`);
        
        let sharpInstance = sharp(inputPath);
        
        // 根据格式设置质量参数
        switch (output_format) {
            case 'jpeg':
                sharpInstance = sharpInstance.jpeg({ quality });
                break;
            case 'png':
                sharpInstance = sharpInstance.png();
                break;
            case 'webp':
                sharpInstance = sharpInstance.webp({ quality });
                break;
            case 'avif':
                sharpInstance = sharpInstance.avif({ quality });
                break;
            case 'tiff':
                sharpInstance = sharpInstance.tiff();
                break;
            case 'gif':
                sharpInstance = sharpInstance.gif();
                break;
            case 'bmp':
                // Sharp 不直接支持 BMP，转为 PNG
                sharpInstance = sharpInstance.png();
                break;
        }
        
        await sharpInstance.toFile(outputPath);
        
        return { image_path: outputPath };
    } catch (error) {
        throw new Error(`图片格式转换失败: ${error.message}`);
    }
}
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
        const inputPath = params.input_image;
        
        // 验证输入文件是否存在
        if (!fs.existsSync(inputPath)) {
            throw new Error(`输入文件不存在: ${inputPath}`);
        }
        
        // 生成输出文件路径
        const outputDir = "/oomol-driver/oomol-storage";
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const ext = path.extname(inputPath);
        const outputPath = path.join(outputDir, `flipped_${Date.now()}${ext}`);
        
        // 使用 Sharp 进行垂直翻转
        await sharp(inputPath)
            .flip()
            .toFile(outputPath);
        
        return { output_image: outputPath };
    } catch (error) {
        throw new Error(`图片垂直翻转处理失败: ${error.message}`);
    }
}
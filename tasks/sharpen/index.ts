import type { Context } from "@oomol/types/oocana";
import sharp from "sharp";
import path from "path";
import fs from "fs";

//#region generated meta
type Inputs = {
    image_path: string;
    sigma: number;
    m1: number;
    m2: number;
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
        const { sigma, m1, m2 } = params;
        
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
        const outputPath = path.join(outputDir, `sharpened_${Date.now()}${ext}`);
        
        // 使用 Sharp 锐化图片
        await sharp(inputPath)
            .sharpen({
                sigma: sigma,
                m1: m1,
                m2: m2
            })
            .toFile(outputPath);
        
        return { output_image: outputPath };
    } catch (error) {
        throw new Error(`图片锐化处理失败: ${error.message}`);
    }
}
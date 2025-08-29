import type { Context } from "@oomol/types/oocana";
import sharp from "sharp";
import path from "path";
import fs from "fs";

//#region generated meta
type Inputs = {
    image_path: string;
    width: number | null;
    height: number | null;
    fit: "cover" | "contain" | "fill" | "inside" | "outside";
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
        const { width, height, fit } = params;
        
        // 验证输入文件是否存在
        if (!fs.existsSync(inputPath)) {
            throw new Error(`输入文件不存在: ${inputPath}`);
        }
        
        // 验证至少指定了宽度或高度
        if (!width && !height) {
            throw new Error("必须指定宽度或高度中的至少一个");
        }
        
        // 生成输出文件路径
        const outputDir = "/oomol-driver/oomol-storage";
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const ext = path.extname(inputPath);
        const outputPath = path.join(outputDir, `resized_${Date.now()}${ext}`);
        
        // 使用 Sharp 调整图片尺寸
        await sharp(inputPath)
            .resize(width, height, { fit })
            .toFile(outputPath);
        
        return { output_image: outputPath };
    } catch (error) {
        throw new Error(`图片尺寸调整处理失败: ${error.message}`);
    }
}
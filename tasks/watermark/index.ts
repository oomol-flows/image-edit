import type { Context } from "@oomol/types/oocana";
import sharp from "sharp";
import path from "path";
import fs from "fs";

//#region generated meta
type Inputs = {
    image_path: string;
    watermark_path: string;
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
    opacity: number;
    scale: number;
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
        const { image_path, watermark_path, position, opacity, scale } = params;
        
        if (!fs.existsSync(image_path)) {
            throw new Error(`输入文件不存在: ${image_path}`);
        }
        
        if (!fs.existsSync(watermark_path)) {
            throw new Error(`水印文件不存在: ${watermark_path}`);
        }
        
        const outputDir = "/oomol-driver/oomol-storage";
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const ext = path.extname(image_path);
        const outputPath = path.join(outputDir, `watermarked_${Date.now()}${ext}`);
        
        // 获取主图片信息
        const mainImage = sharp(image_path);
        const { width: mainWidth, height: mainHeight } = await mainImage.metadata();
        
        if (!mainWidth || !mainHeight) {
            throw new Error("无法获取主图片尺寸信息");
        }
        
        // 处理水印图片
        const watermarkImage = sharp(watermark_path);
        const { width: watermarkWidth, height: watermarkHeight } = await watermarkImage.metadata();
        
        if (!watermarkWidth || !watermarkHeight) {
            throw new Error("无法获取水印图片尺寸信息");
        }
        
        // 计算水印尺寸
        const newWatermarkWidth = Math.round(watermarkWidth * scale);
        const newWatermarkHeight = Math.round(watermarkHeight * scale);
        
        // 计算水印位置
        let left = 0, top = 0;
        const margin = 20;
        
        switch (position) {
            case "top-left":
                left = margin;
                top = margin;
                break;
            case "top-right":
                left = mainWidth - newWatermarkWidth - margin;
                top = margin;
                break;
            case "bottom-left":
                left = margin;
                top = mainHeight - newWatermarkHeight - margin;
                break;
            case "bottom-right":
                left = mainWidth - newWatermarkWidth - margin;
                top = mainHeight - newWatermarkHeight - margin;
                break;
            case "center":
                left = Math.round((mainWidth - newWatermarkWidth) / 2);
                top = Math.round((mainHeight - newWatermarkHeight) / 2);
                break;
        }
        
        // 处理水印透明度和尺寸
        const processedWatermark = await watermarkImage
            .resize(newWatermarkWidth, newWatermarkHeight)
            .png()
            .composite([{
                input: Buffer.from(`<svg width="${newWatermarkWidth}" height="${newWatermarkHeight}">
                    <rect width="100%" height="100%" fill="rgba(255,255,255,${1-opacity})"/>
                </svg>`),
                blend: "dest-in"
            }])
            .toBuffer();
        
        // 合成图片
        await mainImage
            .composite([{
                input: processedWatermark,
                left: Math.max(0, left),
                top: Math.max(0, top)
            }])
            .toFile(outputPath);
        
        return { image_path: outputPath };
    } catch (error) {
        throw new Error(`添加水印失败: ${error.message}`);
    }
}
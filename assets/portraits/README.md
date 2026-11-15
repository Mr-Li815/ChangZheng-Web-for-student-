# 背影页：照片抠图与来源

已保存到 `C:/Users/asdfg/Desktop/长征网站/assets/portraits/`：

| 卡片 | 文件 | 影像性质及来源 |
|---|---|---|
| 钟赤兵 | zhong.webp | [飞机前历史留影](https://k.sina.cn/article_7399635866_1b90d7b9a001011cnz.html) |
| 陈树湘 | chen-statue.webp | 用户指定的[纪念铜像实拍](https://www.sohu.com/a/460229592_120214188)，页面明确标注“纪念像”；[未留存生前照片的资料说明](https://www.icswb.com/h/102063/20180527/540776.html) |
| 徐解秀 | xu.webp | [1984年讲述“半条被子”故事的照片，罗开富摄](https://www.dswxyjy.org.cn/BIG5/n1/2025/1105/c244516-40597431.html) |
| 刘伯承 | liu.webp | [1955年历史肖像资料页](https://commons.wikimedia.org/wiki/File:Liu_Bocheng.jpg) |
| 无名者 | red-army.webp | [红军历史群像](https://commons.wikimedia.org/wiki/File:Red_Army_2.jpg)，用于时代背景展示，不将图中人物指认为红三十四师无名战士 |
| 文学里的红军 | wang.webp | [作者王愿坚在写作中的照片](https://www.chinawriter.com.cn/n1/2017/0322/c404006-29160752.html)，卡片标明作者身份 |

抠图使用内置 imagegen（背景分离模式），随后以 Sharp 机械缩放、压缩为带透明通道的 WebP。原故事、年龄对应资料和底部生平文本保留；影像来源也已放入网页“影像来源与说明”。

## 使用的完整提示词

### 钟赤兵

Use case: background-extraction / identity-preserve. This exact archival photograph is the edit target. Isolate ONLY the real man Zhong Chibing in the foreground, wearing a cap, round glasses and buttoned tunic. Remove the aircraft, shrubs and all background people/objects. Preserve the exact original man's face, hat, glasses, expression, pose, proportions, visible upper body, clothing and black-and-white photo texture. Do not reconstruct lower body or add hands beyond the original crop. Do not redraw, beautify, colorize, alter his age, or create a replacement person. Closely frame the existing visible upper body and shoulders. Clean genuine transparent alpha background, no halo, no shadow and no text.

### 陈树湘纪念像

Use case: background-extraction. Edit target is this exact museum photograph of a bronze memorial bust of Chen Shuxiang at the center. Isolate ONLY the existing bronze bust including its head, cap, shoulders and chest. Remove the museum wall, flags, pedestal, floor, information board and the decorative red ribbon/flower in front of the lower bust. Preserve the original photographed sculpture's exact facial shape, sculpted cap, bronze surface, pose, lighting and material. This must remain a photograph of a bronze memorial statue, never turn it into a living human. Do not redesign the sculpture or invent a body. Crop tightly around the visible bust with small breathing room. Output genuinely transparent background with clean alpha edges, no shadow or text.

### 徐解秀

Use case: background-extraction / identity-preserve. Edit target: this archival black-and-white photograph. Isolate ONLY the elderly woman Xu Jiexiu at center-front, the bald elderly woman in profile facing left, wearing a dark jacket and a shoulder bag/strap. Remove the surroundings and ALL other people, including the man at left, children, woman behind her, and people at right. Keep only the visible parts of her head, face, neck, jacket, arms, lower clothing and bag as photographed. Preserve her exact original face, wrinkles, identity, pose, clothing, tones and coarse archival texture. Do not invent occluded parts, restore youth, add hair, beautify, colorize or draw. Tightly frame her existing visible body with a little transparent breathing room, not a giant empty canvas. Clean genuinely transparent alpha background. No text, no shadow.

### 刘伯承

Use case: background-extraction. Edit target: this exact historical black-and-white photograph of Liu Bocheng. Remove ONLY the gray background outside the man. Output a clean transparent PNG cutout of the same visible man, hat, glasses, head, shoulders, chest, medals and uniform. Preserve the original face, identity, age, expression, pose, clothing, insignia, photograph texture, proportions, crop and black-and-white tones exactly. Do not repaint, beautify, colorize, relight, synthesize, reconstruct missing body parts, or create a new portrait. Fine clean alpha around the cap and shoulders. No drop shadow or text. The background must be genuinely transparent.

### 红军群像

Use case: background-extraction / identity-preserve. Edit this exact 1930s black-and-white group photograph. Preserve ALL photographed people as one group cutout, their exact faces, hats, coats, poses, positions, sizes, archival grain and black-and-white tones. Remove only the building/sky/wall background around the group and the ground below. Retain original body overlaps, do not reconstruct hidden body parts, do not swap or invent people, do not beautify or colorize. Maintain the original wide group composition tightly framed. Produce genuinely transparent alpha background, no added halo, shadow or text.

### 王愿坚

Use case: background-extraction / identity-preserve. Edit target: this exact archival black-and-white photo of writer Wang Yuanjian writing. Remove only the background bookshelf, lamp, desk and objects outside his body. Preserve the exact photographed man from his visible head through torso, sleeves and both hands holding the pen. Keep the original face, identity, expression, pose, skin, uniform and archival photo texture exactly. Keep the pen held in his hand. Do not change his face, invent missing body, redraw, sharpen into an illustration, colorize or beautify. Center the existing visible man in a tightly framed clean transparent PNG, with genuinely transparent background, no table or text or shadow.

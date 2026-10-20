# Yuchen Luo · Personal Homepage

浅蓝与白色的简约学术主页模板。主页为静态 HTML，直接兼容 GitHub Pages，无需安装 Jekyll 或前端依赖。独立的 **Beyond Research** 页面包含 Belial（贝利亚）的介绍和九张照片组成的相册及一段视频，并展示 Kyokushin Karate 的训练经历；CSSA@UoM 栏目介绍技术服务、行前会组织与 AI / IT 社区分享经历。

仓库：<https://github.com/BlodyH/blodyh.github.io>

网站：<https://blodyh.github.io/>。

## 本地预览

在仓库目录运行：

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

然后访问 <http://127.0.0.1:8765/>。按 `Ctrl+C` 结束预览。也可以直接用浏览器打开 `index.html`，两个页面及相互跳转均可使用。

## 修改内容

所有个人资料集中在 `homepage.json`。修改后运行：

```sh
node scripts/build-homepage.mjs
```

也可以使用 `npm run build:homepage`，不需要先执行 `npm install`。脚本生成 `index.html` 和 `beyond/index.html`，请将它们和内容配置一起保留。

| 内容 | 配置字段 |
| --- | --- |
| 姓名、身份、学校、邮箱、照片 | `profile` |
| Google Scholar、LinkedIn、GitHub | `profile.scholar`、`profile.linkedin`、`profile.github`，填写完整网址 |
| CV 文件 | `profile.cv`，可填 `files/cv.pdf` 或完整网址，留空时隐藏 |
| 办公室地图 | `profile.officeMapUrl`，页面只显示图标，不显示街道或楼层 |
| 个人简介 | `about`，支持简单的行内 HTML 链接 |
| 研究方向 | `research` |
| 新闻动态 | `news`，为空时隐藏 |
| 论文列表与分组 | `publications`、`publicationGroups` |
| 教育经历 | `education` |
| 教学、学术服务 | `teachingAppointment`、`teaching`、`service` |
| 科研工作经历 | `researchExperience` |
| 荣誉与奖项 | `awards` |
| 学术之外 | `beyond.intro`、`beyond.sections` |

个人链接已接入 Scholar、LinkedIn 和 GitHub。论文按 LLM Robustness 和 Time Series 两个主题分组：四篇在审稿件仅显示标题与 Under review 状态，两篇公开论文列出作者、正式来源及链接。教育经历使用起止月份，并标注本科、硕士的专业和 WAM；Handbook 链接直接放在专业文字上，可用 `field`、`fieldLabel`、`wam`、`handbookUrl` 修改。教学经历按年份倒序列出课程与任职，课程名链接至对应年份的 Handbook，并标注 Tutor、Head Tutor 或 Marker。Research experience 单列工程应用中的统计模型校准 RA 经历；教育部分包含 VCE 和 ATAR 99.80。学术服务列出 Neural Networks 和 ICLR 2027 审稿。简介、教育与奖项以原仓库和本人提供的信息为依据，没有使用旧主题的示例论文或教学经历。头像继续使用原仓库照片，`assets/profile.jpg` 是缩小文件体积后的网页版本，原图未改动。

### 补充论文

向 `publications` 数组添加对象，字段如下。以下仅是字段示例，不是实际论文：

```json
{
  "title": "论文标题",
  "group": "time-series-statistics",
  "status": "published",
  "authors": "作者列表",
  "venue": "会议或期刊缩写",
  "year": "年份",
  "url": "https://example.com/paper",
  "note": "可选备注",
  "links": [
    { "label": "Paper", "url": "https://example.com/paper" },
    { "label": "Code", "url": "https://example.com/code" }
  ]
}
```

分组 ID 与 `publicationGroups` 中的 ID 对应：`llm-robustness` 为 LLM Robustness，`time-series-statistics` 为 Time Series。顺序由该数组决定，组内顺序保持 `publications` 的输入顺序。

双盲在审稿件使用 `"status": "under-review"`，只需提供 `title` 和 `group`。生成器会强制跳过作者、投稿 venue、年份及所有链接。

已公开论文的年份按正式来源核对：Implicit Decoding 标为 NeurIPS 2025；Adapformer 标为 Neural Networks 2026（卷 193，文章 107988），同时注明 2025 年在线发表。Scholar 的年份与正式会议或期刊卷期可能不同。

### 补充学术之外的内容

`beyond.sections` 中第一项为 `type: "pet"` 的 Belial 相册，第二项为 `type: "martial-arts"` 的极真空手道栏目，第三项为 `type: "community"` 的 CSSA@UoM 栏目。后续仍可添加 `type: "text"` 的通用正文、图片或链接。通用文字段落示例：

```json
{
  "type": "text",
  "title": "栏目标题",
  "paragraphs": ["第一段文字。", "第二段文字。"],
  "image": "images/your-photo.jpg",
  "imageAlt": "照片描述",
  "caption": "可选图片说明",
  "links": []
}
```

Belial 的照片放在 `assets/belial/`。每张照片包含完整 WebP 和 `-thumb.webp` 缩略图；相册配置的 `src`、`thumbnail`、`alt`、`caption` 与 `position` 分别控制完整图片、缩略图、无障碍描述、图注及缩略图的取景位置。第一张照片作为主图，其余八张进入相册。所有九张都可点击放大，支持前后切换、方向键、Esc 关闭与焦点返回；关闭 JavaScript 时仍可直接打开图片。

当前主图为 “Just checking in.”，即凑近镜头、鼻子呈爱心形的照片。视频通过相册项的 `video` 对象配置，包含 `src`、`poster`、`title`、`caption`、`width`、`height`。视频保存在 `assets/belial/belial-playing.mp4`，封面取自视频本身；使用 H.264 / AAC、原生播放控件和手机内联播放，点击后播放。原始 MOV 未修改。

照片通过内置 image_gen 做轻度修饰，提亮白毛、淡化泪痕并柔化背景；Photos 照片库中的原始 HEIC 未修改。网页图片已优化体积，生日、品种、性别及名字来源由本人提供。

极真空手道栏目使用本人提供的训练经历和原始训练照，记录 2012 年至今的练习、1st Kyu 级位及两次上海锦标赛夺冠。照片说明明确为多年前的影像，不代表当前体型。可在该栏目的 `paragraphs`、`period`、`grade`、`image`、`photoNote` 和 `signoff` 中编辑；`dojoKun` 记录官方七条道场训的精简英文意译及来源链接（https://www.kyokushinkaikan.org/en/philosophy/），不将意译标为逐字引文。正文的 EN / 中文按钮只切换个人感悟，默认英文；原英文存于 `paragraphs`，中文存于 `paragraphsZh`。道场训的每条 `precepts` 记录为 `{ "zh": "中文", "en": "English" }`，固定中文在上、英文在下。未启用 JavaScript 时默认英文仍可阅读。贝利亚的遛狗邀请可在 `walkInvitation` 修改。网页图片在 `assets/karate/`，只作格式和体积优化，未改变原图中的人物或体型。

空手道的中文感悟采用本人提供的三段完整原文，排版适配长文；道场训中文采用本人提供的七条文本，英文感悟和英文训诫保持原文。该栏的语言控件显示为更紧凑的 EN / 中文，两栏从正文首行齐头排布，道场训采用紧凑排版。

CSSA@UoM 栏目使用本人提供的任职与活动经历，官网名称及链接参考 https://cssaunimelb.com/ 。CSSA 的 `languages` 仅保留英文 `en`，包含 `intro`、`roles`、`work` 和 `reflections`；该栏目不显示语言按钮或中文正文。副主席任期按上下文整理为 Sep 2025 — Jun 2026。行前会规模明确为 100 多个家庭、北京／上海／广州三个城市和两个周末，未将家庭数写作学生人数。行业分享侧重技术、业务和产品视角，不逐一列出嘉宾履历。社团描述使用 Chinese student society；目前仅展示精简英文版。末段说明为平衡学业与生活暂别 CSSA，同时保持服务社区的热情。图片位于 `assets/cssa/`，使用本人提供的留学手册照片；只优化格式和体积，未改动原图内容。

教学的字段为 `year`、`title`、`code`、`role`、`handbookUrl` 和可选的 `detail`。课程按年份自动倒序排列，同年内保留输入顺序；`role` 为 `Head Tutor` 时突出标注。`teachingAppointment` 记录整体机构与起止时间。

RA 经历放在 `researchExperience`，字段为 `period`、`title`、`institution`、`description`、`collaborators`（包含 `name` 与可选 `url`）。VCE 教育记录使用 `atar` 字符串，保留小数点后两位。学术服务字段为 `title`、`detail`、`period`；新闻动态为 `date`、`text`。

## 修改设计

- `assets/css/personal.css`：排版、间距与响应式布局。顶部 `:root` 集中定义颜色。
- `assets/js/personal.js`：手机菜单与当前位置导航。
- `scripts/build-homepage.mjs`：页面结构、HTML 生成逻辑。
- `assets/favicon.svg`：YL 字母图标。

色彩以柔和的墨尔本蓝为方向：链接 `#466d8c`、浅蓝底色 `#edf3f7`、正文 `#293b48`。标题使用系统衬线字体，正文使用系统无衬线字体，不依赖外部字体服务。

## 仓库与发布方式

GitHub Pages 使用 `master` 分支的仓库根目录。根目录 `.nojekyll` 让 Pages 直接托管生成的静态页面。修改 `homepage.json` 后先运行 `node scripts/build-homepage.mjs`，再将配置、生成的 HTML 和相关资源一起提交并推送；由仓库现有的 Pages 流程完成部署。

原来的 `_pages`、`_layouts`、`_publications` 等 Jekyll 源文件原样保留，便于查阅和回退；新模板不使用这些旧页面或示例内容，也不生成原主题的子页面。

## 设计参考

主要参考前三个主页的信息层次、侧栏与简洁排版，重新实现配色和页面结构：

- <https://rakuyorain.github.io/>
- <https://yuanyuanw2.github.io/>
- <https://lww28.github.io/>

第四个主页仅作为风格边界参考：<https://zhouchuancn.github.io/>。

导师及合作人的链接使用 `person-link` 样式，统一稍微放大并加粗。About 与研究方向保持概括性表述；博士研究主线参考 confirmation 中的稳健 post-training 与能力保留，统计兴趣包括 uncertainty quantification 和 conformal prediction。

原仓库的主题授权保留在 `LICENSE` 中。

# Phaser vendor cache

模板先读取 `phaser.min.js`，文件缺失时才回退到固定的 jsDelivr Phaser 3.90.0。

- Version: `3.90.0`
- Expected SHA-256: `e92ddef111ba42e92d316979c732311757093688ea1810591cb7aa2858eba7a7`
- License: MIT，见 `PHASER_LICENSE.txt`

在仓库根目录运行：

```sh
node scripts/cache-phaser.mjs
```

脚本下载到临时文件，检查最小尺寸与固定 SHA-256，校验通过后才原子替换缓存。`npm run validate` 和生成项目的 `npm run validate` 也会复核该 hash。

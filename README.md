# Switch2IDEA

一个简单的 VS Code 扩展,用于快速在 VS Code 和 IntelliJ IDEA 之间切换当前文件。

## 功能特性

- 通过快捷键或右键菜单,在 IDEA 中打开当前文件
- 保持光标位置,在 IDEA 中定位到相同的行和列
- 支持从文件浏览器中右键打开文件
- 支持打开整个项目到 IDEA

## 使用方法

1. 使用快捷键 `Alt+Shift+O` 在 IDEA 中打开当前文件
2. 使用快捷键 `Alt+Shift+P` 在 IDEA 中打开当前项目
3. 在编辑器中右键选择 "Open File in IDEA"
4. 在文件浏览器中右键选择:
   - "Open File in IDEA" - 打开单个文件
   - "Open Project in IDEA" - 打开整个项目

## 扩展设置

此扩展提供以下设置:

* `switch2idea.ideaPath`: IDEA 可执行文件的路径
  - macOS 会遍历常用安装路径,使用第一个存在的路径,如果没有则默认使用 `IntelliJ IDEA`
  - Windows 默认路径: `C:\Program Files\JetBrains\IntelliJ IDEA\bin\idea64.exe`
  - linux 默认使用: `idea`
* `switch2idea.keyboardShortcut`: 打开 IDEA 的快捷键 (需要重启 VS Code 生效)
  - 打开文件默认快捷键: `alt+shift+o`
  - 打开项目默认快捷键: `alt+shift+p`

## 系统要求

- VS Code 1.93.1 或更高版本
- 已安装 IntelliJ IDEA

## 安装

1. 在 VS Code 扩展市场中搜索 "Switch2IDEA"
2. 点击安装
3. 重启 VS Code

## 常见问题

1. 如果在 macOS 上无法打开 IDEA,请修改 `switch2idea.ideaPath` 为 IDEA 的安装路径

2. 如果在 Windows 上无法打开 IDEA,请检查:
   - IDEA 安装路径是否正确
   - 是否已在设置中配置正确的 ideaPath

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个扩展。

## 更新日志

请查看 [CHANGELOG.md](CHANGELOG.md) 了解详细的更新历史。
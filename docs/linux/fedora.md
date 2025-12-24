Fedora KDE 安装后配置指南

本文档适用于 Fedora 40/41 KDE 版本，涵盖系统初始化配置、软件源更换、常用软件安装及桌面环境优化。

---

一、系统初始更新

安装完成后首先更新系统至最新状态：

```bash
sudo dnf update -y
```

> 提示：如果更新涉及内核，建议重启系统：`sudo reboot`

---

二、更换国内软件源

1. 主仓库源更换（推荐清华源）

备份原始配置：

```bash
sudo cp /etc/yum.repos.d/fedora.repo /etc/yum.repos.d/fedora.repo.bak
sudo cp /etc/yum.repos.d/fedora-updates.repo /etc/yum.repos.d/fedora-updates.repo.bak
```

一键更换为清华源：

```bash
sudo sed -e 's|^metalink=|#metalink=|g' \
         -e 's|^#baseurl=http://download.example/pub/fedora/linux|baseurl=https://mirrors.tuna.tsinghua.edu.cn/fedora|g' \
         -i.bak /etc/yum.repos.d/fedora.repo /etc/yum.repos.d/fedora-updates.repo
```

2. 其他可选镜像源

中科大源：

```bash
sudo sed -e 's|^metalink=|#metalink=|g' \
         -e 's|^#baseurl=http://download.example/pub/fedora/linux|baseurl=https://mirrors.ustc.edu.cn/fedora|g' \
         -i.bak /etc/yum.repos.d/fedora.repo /etc/yum.repos.d/fedora-updates.repo
```

阿里云源：

```bash
sudo sed -e 's|^metalink=|#metalink=|g' \
         -e 's|^#baseurl=http://download.example/pub/fedora/linux|baseurl=https://mirrors.aliyun.com/fedora|g' \
         -i.bak /etc/yum.repos.d/fedora.repo /etc/yum.repos.d/fedora-updates.repo
```

3. 刷新缓存

```bash
sudo dnf clean all
sudo dnf makecache
```

---

三、添加额外软件仓库

1. 启用 RPM Fusion（必需，用于安装多媒体编解码器和专有软件）

```bash
sudo dnf install -y https://mirrors.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm \
                    https://mirrors.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$(rpm -E %fedora).noarch.rpm
```

2. 添加 Flathub（Flatpak 应用商店）

```bash
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
```

---

四、必装软件清单

1. 安装多媒体编解码器

```bash
sudo dnf groupupdate -y core sound-and-video
sudo dnf install -y ffmpeg gstreamer1-plugins-bad-free gstreamer1-plugins-ugly \
                    gstreamer1-vaapi gstreamer1-plugin-openh264
```

2. 安装 Chrome 浏览器

方法 A：官方源安装（推荐）

```bash
sudo dnf install -y fedora-workstation-repositories
sudo dnf config-manager --set-enabled google-chrome
sudo dnf install -y google-chrome-stable
```

方法 B：手动安装

```bash
wget https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm
sudo dnf install -y ./google-chrome-stable_current_x86_64.rpm
```

3. 安装 VS Code

方法 A：官方源安装（推荐）

```bash
sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc
sudo sh -c 'echo -e "[code]\nname=Visual Studio Code\nbaseurl=https://packages.microsoft.com/yumrepos/vscode\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc" > /etc/yum.repos.d/vscode.repo'
sudo dnf install -y code
```

方法 B：Flatpak 安装

```bash
flatpak install -y flathub com.visualstudio.code
```

4. 安装其他常用软件

```bash
# 压缩工具
sudo dnf install -y p7zip p7zip-plugins unrar

# 下载工具
sudo dnf install -y wget curl aria2

# 字体（推荐文泉驿微米黑）
sudo dnf install -y wqy-microhei-fonts

# 截图工具
sudo dnf install -y flameshot

# 系统监控
sudo dnf install -y htop neofetch

# BT下载
sudo dnf install -y qbittorrent

# 影音播放
flatpak install -y flathub org.videolan.VLC
```

---

五、KDE 桌面环境配置

1. 优化系统设置

设置 → 电源管理
- 关闭屏幕：15分钟
- 挂起会话：从不（防止合盖休眠）

设置 → 显示与监控 → 混合睡眠
- 关闭"启用睡眠"（如需合盖不休眠）

设置 → 启动与关机 → 桌面会话
- 登录时：启动为空会话

2. 安装 KDE 主题和插件

```bash
# 推荐安装
sudo dnf install -y plasma-discover-offline-updates plasma-browser-integration \
                    kde-connect kmail korganizer

# 主题管理
sudo dnf install -y plasma-workspace-wallpapers
```

3. 配置终端（Konsole）

打开 Konsole → 设置 → 编辑当前方案：
- 字体：`FiraCode Nerd Font Mono` 或 `Cascadia Code`（需手动安装）
- 配色方案：推荐 `Breeze Dark`

安装 Nerd Font：

```bash
mkdir -p ~/.local/share/fonts
cd ~/.local/share/fonts
wget https://github.com/ryanoasis/nerd-fonts/releases/download/v3.0.2/FiraCode.zip
unzip FiraCode.zip
rm FiraCode.zip
fc-cache -fv
```

---

六、开发环境配置（可选）

1. 安装 Git

```bash
sudo dnf install -y git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

2. 安装 Docker

```bash
sudo dnf install -y docker
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
# 注销后重新登录生效
```

3. 安装开发工具链

```bash
sudo dnf groupinstall -y "Development Tools" "Development Libraries"
sudo dnf install -y gcc-c++ cmake nodejs npm python3-devel
```

---

七、常用快捷键设置

设置 → 快捷方式 → 自定义快捷方式

推荐添加：
- `Win + T`：启动终端 (`konsole`)
- `Win + E`：启动文件管理器 (`dolphin`)
- `Win + Shift + S`：区域截图 (`flameshot gui`)

---

八、安装中文输入法

```bash
sudo dnf install -y fcitx5 fcitx5-chinese-addons fcitx5-configtool
```

配置环境变量（/.bashrc 或 /.zshrc）：

```bash
export GTK_IM_MODULE=fcitx5
export QT_IM_MODULE=fcitx5
export XMODIFIERS=@im=fcitx5
```

重启后通过 `fcitx5-configtool` 添加拼音输入法。

---

九、其他优化

1. 减少 `dnf` 内存使用

```bash
echo "max_parallel_downloads=10" | sudo tee -a /etc/dnf/dnf.conf
```

2. 启用 zram（提升内存效率）

```bash
sudo systemctl enable --now zram-generator
```

3. 清理旧内核（保留最新2个）

```bash
sudo dnf install -y dnf-plugins-core
sudo dnf config-manager --set-opt installonly_limit=2
sudo dnf remove --oldinstallonly
```

---

十、故障排除

问题 1：软件商店（Discover）打不开

```bash
sudo rm -rf /var/cache/PackageKit
sudo systemctl restart packagekit
```

问题 2：Flatpak 应用无法启动

```bash
sudo flatpak repair
flatpak update
```

问题 3：右键没有"在终端中打开"

```bash
sudo dnf install -y kde-partitionmanager
```

---

总结

完成以上配置后，您的 Fedora KDE 系统应该已经：
- ✅ 更新到最新状态
- ✅ 切换到国内高速镜像源
- ✅ 拥有完整的媒体编解码器支持
- ✅ 安装常用生产力工具
- ✅ 优化了桌面体验

现在可以开始高效工作和学习了！

---

文档版本：v1.0 | 最后更新：2024-12-24

适用系统：Fedora 40/41 KDE Spin
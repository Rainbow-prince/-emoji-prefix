const {Plugin, PluginSettingTab, Setting, Notice} = require('obsidian');

// 设置默认值
const DEFAULT_SETTINGS = {
    mySetting: "default",
};

// 插件主体
module.exports = class MyPlugin extends Plugin {
    async onload() {
        // 加载配置文件
        await this.loadSettings();

        // 添加命令：为各级标题添加前缀
        this.addCommand({
            id: "add-prefix-to-headers",
            name: "Add Prefix to Headers",
            editorCallback: async (editor) => { // 注意这里使用了 editorCallback 而不是 callback
                await this.addPrefixToHeaders(editor); // 传递 editor 实例到你的函数
                new Notice("已添加前缀到标题");
            },
            hotkeys: [{modifiers: ["Ctrl", "Shift"], key: "U"}] // 设置快捷键为 Ctrl+Shift+U
        });

        // 添加命令：移除各级标题的前缀
        this.addCommand({
            id: "remove-prefix-from-headers",
            name: "Remove Prefix from Headers",
            editorCallback: async (editor) => {
                await this.removePrefixFromHeaders(editor);
                new Notice("已移除前缀从标题");
            },
            hotkeys: [{modifiers: ["Ctrl", "Shift"], key: "R"}] // 设置快捷键为 Ctrl+Shift+R
        });


        // 添加Ribbon
        this.addRibbonIcon("circle", "Click me", () => {
            new Notice("Hello, ribbon!");
        });

        // 添加状态栏
        this.addStatusBarItem().createEl("span", {text: "Hello status bar 👋"});

        // 添加配置面板
        this.addSettingTab(new MySettingTab(this.app, this));
    }

    onunload() {
    }

    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData()
        );
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async addPrefixToHeaders(editor) {
        new Notice("准备添加前缀");
        const prefixes = {
            1: "🌕",
            2: "🌖",
            3: "🌗",
            4: "🌘",
            5: "🌑",
            6: "⭐"
        };
        // 正则表达式匹配Markdown标题
        // const headerPattern = /^(#{1,6})\s+(.*)$/gm;  // 只能匹配到标题
        const headerPattern = /^(#{1,6})\s+(?:(🌕|🌖|🌗|🌘|🌑|⭐)\s*)?(.*)$/gm;  // 尝试匹配有前缀的
        // 获取编辑器内容，似乎已经成功
        const content = editor.getValue();
        console.log(content);  // 在终端输出内容
        let modifiedContent = content;

        // todo: 替换标题，添加前缀（现在只剩下替换的逻辑有问题了）

        // 似乎是因为match是一个字符串而不是捕获组
        // modifiedContent = modifiedContent.replace(headerPattern, (match) => {
        //     const level = match[1]; // 获取标题级别
        //     const title = match[2]; // 获取标题文本
        //     const headerLevel = level.length; // 获取标题级别
        //     const prefix = prefixes[headerLevel] || ''; // 获取对应级别的前缀
        //     return `${level} ${prefix}${title}`; // 返回带有前缀的标题
        // });

        // 能够匹配前缀了，但是还是会重复添加
        // modifiedContent = modifiedContent.replace(headerPattern, (match, level, title) => {
        //     const headerLevel = level.length; // 获取标题级别
        //     const prefix = prefixes[headerLevel] || ''; // 获取对应级别的前缀
        //     return `${level} ${prefix}${title}`; // 返回带有前缀的标题
        // });

        // 能够不重复地添加标题，但是对于代码块中的#还是会被匹配为标题
        modifiedContent = modifiedContent.replace(headerPattern, (match, level, prefix, title) => {
            const headerLevel = level.length; // 获取标题级别
            const actualPrefix = prefix || prefixes[headerLevel] || ''; // 如果已经有前缀，则使用它，否则使用默认前缀
            return `${level} ${actualPrefix}${title}`; // 返回带有前缀的标题
        });

        console.log("替换之后");  // 在终端输出内容
        console.log(modifiedContent);  // 应该输出替换后的content

        // 设置编辑器内容
        editor.setValue(modifiedContent);
    }

    async removePrefixFromHeaders(editor) {
        new Notice("准备添加前缀");
        const prefixes = {
            1: "🌕",
            2: "🌖",
            3: "🌗",
            4: "🌘",
            5: "🌑",
            6: "⭐"
        };
        const headerPattern = /^(#{1,6})\s+(?:([🌕🌖🌗🌘🌑⭐])\s*)?(.*)$/gm;
        const content = editor.getValue();
        let modifiedContent = content;

        modifiedContent = modifiedContent.replace(headerPattern, (match, level, prefix, title) => {
            const headerLevel = level.length;
            const actualPrefix = prefix || prefixes[headerLevel] || '';
            return `${level} ${actualPrefix}${title}`;
        });

        editor.setValue(modifiedContent);
    }

    async removePrefixFromHeaders(editor) {
        new Notice("准备移除前缀");
        const prefixes = {
            1: "🌕",
            2: "🌖",
            3: "🌗",
            4: "🌘",
            5: "🌑",
            6: "⭐"
        };
        const headerPattern = /^(#{1,6})\s+(?:([🌕🌖🌗🌘🌑⭐])\s*)?(.*)$/gm;
        const content = editor.getValue();
        let modifiedContent = content;

        // 替换标题，移除前缀
        modifiedContent = modifiedContent.replace(headerPattern, (match, level, prefix, title) => {
            if (prefix) {
                // 如果标题中存在前缀，则移除该前缀
                // 直接使用 level 和 title 拼接，忽略 prefix
                return `${level} ${title.substr(1)}`;
            } else {
                // 如果没有匹配到前缀（即标题中没有前缀或不包含在 prefixes 中的前缀），则不做改变
                // 返回原始匹配的字符串 match
                return match;
            }
        });

        editor.setValue(modifiedContent);

    }
}

// 设置面板
class MySettingTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        const {containerEl} = this;
        containerEl.empty();

        new Setting(containerEl)
            .setName("Setting #1")
            .setDesc("It's a secret")
            .addText((text) =>
                text
                    .setPlaceholder("Enter your secret")
                    .setValue(this.plugin.settings.mySetting)
                    .onChange(async (value) => {
                        this.plugin.settings.mySetting = value;
                        await this.plugin.saveSettings();
                    })
            );
    }
}
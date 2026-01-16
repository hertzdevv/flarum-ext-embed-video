import app from 'flarum/admin/app';

app.initializers.add('hertz-dev-embed-video', () => {
  app.extensionData
    .for('hertz-dev-embed-video')
    
    // 1. 播放器主题色 (Theme Color)
    .registerSetting({
      setting: 'hertz-dev-embed-video.admin.settings.theme',
      label: app.translator.trans('hertz-dev-embed-video.admin.settings.options.theme'),
      type: 'color-preview', // Flarum 自带的颜色选择器
      default: '#ffad00',
    })

    // 2. 播放器语言 (Language)
    .registerSetting({
      setting: 'hertz-dev-embed-video.admin.settings.lang',
      label: app.translator.trans('hertz-dev-embed-video.admin.settings.options.lang'),
      type: 'select',
      options: {
        'en': 'English',
        'zh-cn': '简体中文',
        'zh-tw': '繁體中文',
      },
      default: 'zh-cn',
    })

    // 3. 画质切换开关 (Quality Switching)
    .registerSetting({
      setting: 'hertz-dev-embed-video.admin.settings.quality_switching',
      label: app.translator.trans('hertz-dev-embed-video.admin.settings.options.quality_switching'),
      type: 'boolean',
    })

    // 4. Airplay 支持
    .registerSetting({
      setting: 'hertz-dev-embed-video.admin.settings.airplay',
      label: app.translator.trans('hertz-dev-embed-video.admin.settings.options.airplay'),
      type: 'boolean',
    })

    // 5. 迷你进度条 (Mini Progress Bar) - Artplayer 特性
    .registerSetting({
      setting: 'hertz-dev-embed-video.admin.settings.mini_progress_bar',
      label: app.translator.trans('hertz-dev-embed-video.admin.settings.options.mini_progress_bar'),
      type: 'boolean',
    })

    // 6. 自定义 Logo (可选)
    .registerSetting({
      setting: 'hertz-dev-embed-video.admin.settings.logo',
      label: app.translator.trans('hertz-dev-embed-video.admin.settings.options.logo'),
      type: 'text',
      placeholder: 'https://...',
    })
    // 默认视频封面 (Poster)
    .registerSetting({
      setting: 'hertz-dev-embed-video.admin.settings.default_poster',
      label: app.translator.trans('hertz-dev-embed-video.admin.settings.options.default_poster'),
      type: 'text',
      placeholder: 'https://example.com/poster.jpg',
    })

    // --- 权限设置 ---

    // 7. 谁可以发布视频
    .registerPermission(
      {
        icon: 'fas fa-video',
        label: app.translator.trans('hertz-dev-embed-video.admin.permissions.can_create_video'),
        permission: 'discussion.hertz-dev-embed-video.create', // 注意：后端 PHP 也需同步检查此权限
      },
      'start'
    )

    // 8. 谁可以观看视频
    .registerPermission(
      {
        icon: 'fas fa-eye',
        label: app.translator.trans('hertz-dev-embed-video.admin.permissions.can_view_video'),
        permission: 'discussion.hertz-dev-embed-video.view', // 注意：后端 PHP 也需同步检查此权限
        allowGuest: true,
      },
      'view'
    );
});
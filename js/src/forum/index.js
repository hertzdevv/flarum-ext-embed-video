import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import CommentPost from 'flarum/forum/components/CommentPost';
import ComposerPostPreview from 'flarum/forum/components/ComposerPostPreview';
import TextEditor from 'flarum/common/components/TextEditor';
import Tooltip from 'flarum/common/components/Tooltip';
import Button from 'flarum/common/components/Button';

import Artplayer from 'artplayer';
import Hls from 'hls.js';

// 初始化 Artplayer 的通用函数
function initPlayer(element) {
  const containers = element.querySelectorAll('.hertz-video-container');

  containers.forEach((el) => {
    if (el.dataset.initialized) return;

    const url = el.dataset.url;
    const qualitiesStr = el.dataset.qualities || '';
    const theme = app.forum.attribute('hertzEmbedVideoTheme') || '#ffad00';
    const lang = app.forum.attribute('hertzEmbedVideoLang') || 'zh-cn';
    const defaultPoster = app.forum.attribute('hertzEmbedVideoDefaultPoster') || '';
    const logo = app.forum.attribute('hertzEmbedVideoLogo') || '';
    
    let quality = [];
    if (qualitiesStr) {
      quality = qualitiesStr.split(',').map(item => {
        const parts = item.split(';');
        if (parts.length < 2) return null;
        return { html: parts[0], url: parts[1] };
      }).filter(Boolean);

      if (quality.length > 0) quality[0].default = true;
    }

    const art = new Artplayer({
      container: el,
      url: url,
      poster: defaultPoster,
      logo: logo,
      quality: quality,
      theme: theme,
      volume: 0.5,
      isLive: el.dataset.live === 'true',
      muted: false,
      autoplay: false,
      pip: true,
      
      // ✅ 已确认：这里必须为 false 以配合 CSS 强制比例
      autoSize: false, 
      // ✅ 已确认：这里必须为 false 以修复编辑时弹窗干扰
      autoMini: false, 
      
      setting: true,
      loop: false,
      flip: true,
      playbackRate: true,
      aspectRatio: true,
      fullscreen: true,
      fullscreenWeb: true,
      miniProgressBar: app.forum.attribute('hertzEmbedVideoMiniProgressBar'),
      airplay: app.forum.attribute('hertzEmbedVideoAirplay'),
      lang: lang === 'zh-cn' ? 'zh-cn' : 'en',
      
      customType: {
        m3u8: function (video, url) {
          if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(video);
            // 将 hls 实例挂载到 art 上，方便后续销毁
            art.hls = hls; 
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
          }
        },
      },
    });

    el.dataset.initialized = 'true';
    // 将实例挂载到 DOM 元素上，方便后续读取和销毁
    el._artplayer = art;
  });
}

// 销毁播放器的通用函数 (新增)
function destroyPlayer(element) {
  const containers = element.querySelectorAll('.hertz-video-container');
  containers.forEach((el) => {
    if (el._artplayer) {
      // 如果有 hls 实例，先销毁 hls
      if (el._artplayer.hls) {
        el._artplayer.hls.destroy();
      }
      // 销毁播放器实例，但不移除 DOM (false)
      el._artplayer.destroy(false);
      el._artplayer = null;
      el.dataset.initialized = '';
    }
  });
}

app.initializers.add('hertz-dev/flarum-ext-embed-video', () => {
  
  // 1. 帖子列表：渲染与销毁
  extend(CommentPost.prototype, 'oncreate', function () {
    initPlayer(this.element);
  });
  
  extend(CommentPost.prototype, 'onupdate', function () {
    initPlayer(this.element);
  });

  // ✨ 新增：当帖子组件被移除时（如翻页），销毁播放器释放内存
  extend(CommentPost.prototype, 'onremove', function () {
    destroyPlayer(this.element);
  });

  // 2. 编辑预览：渲染与销毁
  extend(ComposerPostPreview.prototype, 'oncreate', function () {
    initPlayer(this.element);
  });

  extend(ComposerPostPreview.prototype, 'onupdate', function () {
    initPlayer(this.element);
  });
  
  // ✨ 新增：预览组件移除时也清理
  extend(ComposerPostPreview.prototype, 'onremove', function () {
    destroyPlayer(this.element);
  });

  // 3. 添加编辑器按钮
  extend(TextEditor.prototype, 'controlItems', function (items) {
    // ✨ 修复逻辑：如果没有权限，直接返回，不再添加按钮
    if (!app.forum.attribute('canCreateVideo')) {
        return; 
    }

    items.add(
      'hertz-embed-video',
      <Tooltip text={app.translator.trans('hertz-dev-embed-video.admin.permissions.can_create_video')}>
        <Button
          icon="fas fa-play-circle"
          class="Button Button--icon"
          onclick={() => {
            this.attrs.composer.editor.insertAtCursor(
              `[embed-video url="" qualities="SD;URL,HD;URL" live="false"]`
            );
          }}
        />
      </Tooltip>
    );
  });
});
module.exports = {
    locales: {
        '/': {
            lang: 'zh-CN',
            title: 'CadeCode',
            description: 'CadeCode，由 VuePress 驱动的技术博客，专注于 Java、JavaScript 等前后端开发相关内容的分享'
        }
    },
    head: [
		['meta', { name: 'referrer', content: 'no-referrer' }],
		['link', { rel: 'icon', href: '/meta/favicon.ico' }]
	],
    theme: '@cadecode/vuepress-theme-2zh',
    themeConfig: {
		logo: ['image', '/meta/logo.png'],
        pagination: 12,
        domain: 'https://blog.cadecode.top/ ',
        notice: [
            {
                text: 'vuepress 博客主题 2zh 开源地址',
                url: 'https://github.com/cadecode/vuepress-theme-2zh'
            },
            {
                text: 'vuepress 官方文档',
                url: 'https://www.vuepress.cn/'
            },
            {
                text: 'vue 官方文档',
                url: 'https://cn.vuejs.org/v2/guide/'
            },
			{
				text: '拥抱开源， 拥抱变化'
			}
        ],
        author: 'CadeCode',
        links: [
            {text: 'Github', url: 'https://github.com/cadecode'},
            {text: 'Email', url: 'https://mail.qq.com/cgi-bin/qm_share?t=qm_mailme&email=eBsZHB0bFxwdOB4XABUZERRWGxcV'},
            {text: 'JueJin', url: 'https://juejin.cn/user/562546315637662'}
        ]
    }
}

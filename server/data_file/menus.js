module.exports = {
  menuList: [
    {
      userGroup: 1, //visitor
      homePage: {
        url: "public",
        urlMask: "/"
      },
      menuDetail: {
        topMenu: {
          left: [
            {
              title: "facebook",
              icon: "fa fa-facebook-square",
              url: "#"
            },
            {
              title: "instagram",
              icon: "fa fa-instagram",
              url: "#"
            }
          ],
          right: []
        },
        bottomMenu: {
          left: [
            {
              title: "首頁",
              url: "public/",
              urlMask: "/"
            },
            {
              title: "課程體系",
              url: "#"
            },
            {
              title: "公開課",
              url: "#"
            },
            {
              title: "直播課",
              url: "#"
            },
            {
              title: "水平測試",
              url: "#"
            }
          ],
          right: [
            {
              title: "注冊登錄",
              url: "/public/login",
              urlMask: "/login"
            },
            {
              title: "免費試聽",
              url: "#"
            }
          ]
        }
      }
    },
    {
      userGroup: 2, //parent
      homePage: {
        url: "/parent/home"
      },
      menuDetail: {
        topMenu: {
          left: [
            {
              title: "facebook",
              icon: "fa fa-facebook-square",
              url: "https://www.facebook.com/"
            },
            {
              title: "instagram",
              icon: "fa fa-instagram",
              url: "https://www.instagram.com/"
            }
          ],
          right: [
            {
              title: "用戶管理",
              url: "/parent/setting"
            },
            {
              title: "購買",
              url: "/parent/purchase"
            },
            {
              title: "我的訂單",
              url: "/parent/orders"
            },
            {
              title: "在線教室檢測",
              url: "/public/hardware"
            },
            {
              title: "常用軟件",
              url: "/public/software",
              urlMask: "/software"
            }
          ]
        },
        bottomMenu: {
          left: [
            {
              title: "個人主頁",
              url: "/parent/home"
            },
            {
              title: "發現老師",
              url: "#"
            },
            {
              title: "公開課",
              url: "#"
            },
            {
              title: "BrainWave",
              url: "#"
            }
          ],
          right: [
            {
              title: "登出",
              url: "/logout"
            }
          ]
        }
      }
    },
    {
      userGroup: 3 //parent
    }
  ]
};

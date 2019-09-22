var request = require('../../utils/http');
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    region: [],
    weather: {},
    hasWeatherData: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    qqmapsdk = new QQMapWX({
      key: '此处需要填写注册的key值'
    });
  },

  /**
   * 生命周期函数--监听页面显示，页面从后台隐藏到前台显示时触发该钩子
   */
  onShow: function () {
    this.getAuthForLocation();
  },

  bindRegionChange: function(e) {
    this.setData({
      region: e.detail.value
    }, () => {
      this.getWetherData();
    })
  },

  getWetherData: function() {
    request.http({
      url: 'https://free-api.heweather.net/s6/weather/now',
      data: {
        key: '此处需要填写注册的key值',
        location: this.data.region[1]
      }
    }).then(res => {
      this.setData({
        weather: res.data.HeWeather6[0].now,
        hasWeatherData: Object.keys(res.data.HeWeather6[0].now).length > 0
      })
    }).catch(err => {
      console.error(err);
    });
  },

  getAuthForLocation: function() {
    wx.getSetting({
      success: (result) => {
        if (result.authSetting['scope.userLocation'] !== undefined && result.authSetting['scope.userLocation'] !== true) {
          wx.showModal({
            title: '请求授权当前位置',
            content: '需要获取您的地理位置，请确认授权',
            success: (result) => {
              if(result.confirm){
                wx.openSetting({
                  success: (result) => {
                    if (result.authSetting['scope.userLocation'] === true){
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        duration: 1500
                      });
                      this.getLocation();
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'none',
                        duration: 1500
                      });
                    }
                  }
                });
              } else {
                wx.showToast({
                  title: '拒绝授权',
                  icon: 'none',
                  duration: 1500
                });
              }
            }
          });
        } else {
          this.getLocation();
        }
      }
    });
  },

  getLocation: function() {
    let self = this;
    wx.getLocation({
      type: 'wgs84',
      success: function(result) {
        qqmapsdk.reverseGeocoder({
          location: `${result.latitude},${result.longitude}`,
          success: function(res) {
            let addrs = res.result.ad_info;
            let tmpRegion = [addrs.province, addrs.city, addrs.district];
            self.setData({
              region: tmpRegion
            }, () => {
              self.getWetherData();
            });
          },
          fail: function(err) {
            console.error(err);
          }
        })
      }
    });
  }
})

function http(params = {}) {
    wx.showLoading({
        title: '加载中',
        mask: true
    });
    return new Promise((resolve, reject) => {
        wx.request({
            url: params.url,
            data: params.data,
            header: {
                'content-type': 'application/json'
            },
            method: 'GET',
            success: (result)=>{
                wx.hideLoading();
                if (result.statusCode === 200) {
                    resolve(result);
                } else {
                    reject(result);
                }
            },
            fail: (err) => {
                wx.hideLoading();
                reject(err);
            }
        });
    })
}

module.exports = {
    http: http
}

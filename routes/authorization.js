const router = require('koa-router')()
const rp = require('request-promise');
const moment = require('moment')
const _ = require('lodash')
const AV = require('leancloud-storage')
const db = require('../lib/db')
const config = require('../lib/config');

// 微信授权回调接口
router.get('/wxAuthorization',
  async(ctx, next) => {
    try {
      let code = ctx.query.code || `authorization_code`
      if (_.isUndefined(code)) {
        return ctx.body = {
          status: -1,
          data: {},
          msg: `code missing`
        }
      }
      let time = moment().format('YYYY-MM-DD HH:MM:SS')
      let options = {
        url: `https://api.weixin.qq.com/sns/oauth2/access\_token`,
        qs: {
          appid: config.wxpt.appid,
          secret: config.wxpt.secret,
          code: code,
          grant_type: `authorization_code`
        },
        headers: {
          'User-Agent': 'Request-Promise'
        },
        json: true
      }
      let result = await rp(options)
      console.log(`access-token ->${JSON.stringify(result)}`)
      options = {
        url: `https://api.weixin.qq.com/sns/userinfo`,
        qs: {
          access_token: result.access_token,
          openid: result.openid,
          lang: `zh_CN`
        },
        headers: {
          'User-Agent': 'Request-Promise'
        },
        json: true
      }
      /* ret form
      {   "openid":" OPENID",
          "nickname": NICKNAME,
          "sex":"1",
          "province":"PROVINCE"
          "city":"CITY",
          "country":"COUNTRY",
          "headimgurl":    "http://wx.qlogo.cn/mmopen/g3MonUZtNHkdmzicIlibx6iaFqAc56vxLSUfpb6n5WKSYVY0ChQKkiaJSgQ1dZuTOgvLLrhJbERQQ4eMsv84eavHiaiceqxibJxCfHe/46",
          "privilege":[ "PRIVILEGE1" "PRIVILEGE2"     ],
          "unionid": "o6\_bmasdasdsad6\_2sgVt7hMZOPfL"
      }
      */
      let ret = await rp(options)
      if(_.isUndefined(_.get(ret, `unionid`, undefined))){
        return ctx.body = {
          status: -1,
          data: {},
          msg: `get code fail`
        }
      }
      console.log(`ret ->${JSON.stringify(ret)}`)
      let query = new AV.Query('_User')
      query.equalTo('wxUid', ret.unionid)
      let uesr = await query.first()
      if (_.isUndefined(user)) {
        return ctx.body = {
          status: 403,
          data: {},
          msg: `请先在App内绑定微信`
        }
      } else {
        let sql = `insert into WxUser values(null, ${user.get('objectId')}, ${ret.unionid}, ${result.openid}, ${user.get('mobilePhoneNumber')}, ${time}, ${time})`
        let dbret = await db.excute(sql)
        console.log(`dbret => ${JSON.stringify(dbret)}`)
        if (_.isEmpty(dbret)) {
          return ctx.body = {
            status: -1,
            data: {},
            msg: `data err ->${err}`
          }
        } else {
          ctx.body = {
            status: 200,
            data: ret,
            msg: `success`
          }
        }
      }
    } catch (err) {
      ctx.body = {
        status: -1,
        data: {},
        msg: `wxAuthorization err => ${err}`
      }
    }
  }
)

module.exports = router

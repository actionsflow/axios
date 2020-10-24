
import * as core from '@actions/core'
import { AxiosRequestConfig, Method, AxiosBasicCredentials, AxiosProxyConfig} from 'axios'
import {getEscapeString} from './util'
// builder for request config

const builder = {
    basicAuth: (): AxiosBasicCredentials => {
        let authArr: string[] = core.getInput('basic-auth').trim().split(':');
        if(authArr.length !== 2){
            throw new Error('basic-auth format is invalid. The valid format should be username:password.');
        }
        return { 
            username: authArr[0], 
            password: authArr[1]
        }
    },
    bearerToken: (): string => {
        return `Bearer ${core.getInput('bearer-token')}`;
    },
    proxy: (): AxiosProxyConfig => {
        let proxy: AxiosProxyConfig;
        if(core.getInput('proxy-url').includes('//')){
            const proxyUrlArr: string[] = core.getInput('proxy-url').replace('//', '').trim().split(':');
            if(proxyUrlArr.length !== 3){
                throw new Error('proxy-url format is invalid. The valid format should be host:port.');
            }
            proxy = {
                protocol: proxyUrlArr[0],
                host: proxyUrlArr[1],
                port: Number(proxyUrlArr[2])
            }
        }else{
            const proxyUrlArr: string[] = core.getInput('proxy-url').trim().split(':');
            if(proxyUrlArr.length !== 2){
                throw new Error('proxy-url format is invalid. The valid format should be host:port.');
            }
            proxy = {
                host: proxyUrlArr[0],
                port: Number(proxyUrlArr[1])
            }  
        }
        if(core.getInput('proxy-auth')){
            const proxyAuthArr: string[] = core.getInput('proxy-auth').trim().split(':');
            if(proxyAuthArr.length !== 2){
                throw new Error('proxy-auth format is invalid. The valid format should be username:password.');
            }
            proxy.auth = {
                username: proxyAuthArr[0],
                password: proxyAuthArr[1]
            }
        }
        return proxy;
    }
}


// Request config  

const config: AxiosRequestConfig = {
    url: core.getInput('url'),
    method: core.getInput('method') as Method,
    timeout: Number(core.getInput('timeout'))
}

if(core.getInput('basic-auth')){
    config.auth = builder.basicAuth()
}
if(core.getInput('data')){
    config.data = getEscapeString(core.getInput('data'))
}else if(core.getInput('body')){
    config.data = getEscapeString(core.getInput('body'))
}
if(core.getInput('headers')){
    config.headers = JSON.parse(getEscapeString(core.getInput('headers')))
}
if(config.data){
    // try parse data
    try {
      const data = JSON.parse(config.data)
      config.data = data;
    }catch(error){
        // do nothing
    }
}

if(core.getInput('content-type')){
    config.headers = { ...config.headers, 'Content-Type': core.getInput('content-typen') }
}

if(core.getInput('params')){
    config.params = JSON.parse(getEscapeString(core.getInput('params')))
}




if(core.getInput('bearer-token')){
    config.headers = { ...config.headers, Authorization: builder.bearerToken() }
}

if(core.getInput('proxy-url')){
    config.proxy = builder.proxy()
}


export default config
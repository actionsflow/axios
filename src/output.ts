import * as core from '@actions/core'
import * as util from './util'
import { AxiosResponse } from 'axios'

function isObject (value:any) {
    return value && typeof value === 'object' && value.constructor === Object;
}
    
    
const setOutput = (res: void | AxiosResponse <any>) => {
    if(!res){
        throw new Error('No response from request')
    }
    util.validateStatusCode(res.status.toString());
    if(core.getInput('is_debug') === 'true'){
        core.info(util.buildOutput(res));
    }
    core.setOutput('status',res.status)
    if(isObject(res.data)){
        core.setOutput('data',JSON.stringify(res.data))

    }else{
        core.setOutput('data',res.data)
    }
    core.setOutput('headers',JSON.stringify(res.headers))
}


export default setOutput
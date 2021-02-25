import * as core from '@actions/core'
import axios, { AxiosResponse, AxiosRequestConfig } from 'axios'
import setOutput from './output'
import execall from "execall";

export const validateStatusCode = (actualStatusCode: string): void => {
    const acceptedStatusCode: string[] = core.getInput('accept')
        .split(",").filter(x => x !== "")
        .map(x => x.trim());
    if (!acceptedStatusCode.includes(actualStatusCode)) {
        throw new Error(`The accepted status code is ${acceptedStatusCode} but got ${actualStatusCode}`)
    }
}

export const buildOutput = (res: AxiosResponse<any>): string => {
    return JSON.stringify({
        "status_code": res.status,
        "data": res.data,
        "headers": res.headers
    })
}

export const sendRequestWithRetry = async (config: AxiosRequestConfig) => {
    var exit = false
    var countRetry = 0
    const retryArr: string[] = core.getInput('retry').split('/')
    const numberOfRetry: number = Number(retryArr[0])
    const backoff: number = Number(retryArr[1])
    do {
        try {
            if (core.getInput('is_debug') === 'true') {
                core.info(`axios config: ${JSON.stringify(config,null,2)}`);
            }
            // create axios with defaults then override with custom config
            const res = await axios.create(config)
            setOutput(res)
            exit = true
        } catch (err) {
            countRetry += 1
            if (countRetry <= numberOfRetry) {
                core.info(`retry: ${countRetry}`)
                await sleep(backoff * 1000)
            } else {
                exit = true
                core.setFailed(err)
            }
        }
    } while (!exit)
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * get escape string like ifttt data
 * <<<escaped>>>
 * @param string 
 */
export function getEscapeString(str:string):string{
    if(str){
        const startSyntax = "<<<";
        const endSyntax = ">>>"
        // regex
        const regex = new RegExp(`${startSyntax}([\\S\\s]*?)${endSyntax}`, "gm");
 
        const matched = execall(regex,str)
        
        if(matched.length>0){
            const strArr = []

            // add first matched
            let currentEndIndex = 0
            if(matched[0].index>0){
                strArr.push(str.slice(0,matched[0].index))
                currentEndIndex = matched[0].index;
            }
            matched.forEach((matchedItem,index)=>{

                const replaceResult = matchedItem.subMatches[0].replace(/[\\]/g, '\\\\')
                .replace(/[\/]/g, '\\/')
                .replace(/[\b]/g, '\\b')
                .replace(/[\f]/g, '\\f')
                .replace(/[\n]/g, '\\n')
                .replace(/[\r]/g, '\\r')
                .replace(/[\t]/g, '\\t')
                .replace(/[\"]/g, '\\"')
                .replace(/\\'/g, "\\'"); 
                strArr.push(replaceResult)
                currentEndIndex = matchedItem.match.length+matchedItem.index
                // push to next 
                if(matched[index+1]){
                    const nextIndex = matched[index+1].index;
                    if(nextIndex>currentEndIndex){
                        strArr.push(str.slice(currentEndIndex,nextIndex))
                        currentEndIndex =  nextIndex
                    }

                }else{
                    // no next
                    if(str.length>currentEndIndex){
                        strArr.push(str.slice(currentEndIndex,str.length))
                        currentEndIndex = str.length
                    }
                }

            })
            return strArr.join('')
        }else{
            return str
        }
        
        

    }else{
        return ''
    }
       
    
    
}

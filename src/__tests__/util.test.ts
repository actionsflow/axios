import {getEscapeString} from '../util'
test('get escape string',()=>{
  const string = getEscapeString(`{
  "test":"<<<test

testend>>>","test2":"teststart<<<"cont
ent">>>"
  }`)
  const json = JSON.parse(string)
    
  
  expect(json.test).toBe(`test

testend`)
expect(json.test2).toBe(`teststart"cont
ent"`)
})
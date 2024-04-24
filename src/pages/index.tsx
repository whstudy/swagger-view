import {Button, Input, Space, Form, Select } from 'antd';
import React, {useEffect, useState} from 'react';
import { history, createSearchParams } from 'umi';
import SwaggerUI from 'swagger-ui-react';
import './swagger-ui-ln.less';
import "swagger-ui-react/swagger-ui.css"
import SwaggerJson from './swagger.json'

let parentTreeArr = []
export default function HomePage() {
  const [form] = Form.useForm();
  const location= window.location
  const [branch, setBranch] = useState(createSearchParams(location.search).get('branch'))
  const [urlSwagger, setUrlSwagger] = useState(createSearchParams(location.search).get('urlSwagger'))
  const [random, setRandom] = useState(Math.random());
  const [branchOptions, setBranchOptions] = useState([]);
  const [logsTree, setLogsTree] = useState([]);

  const loadLogsTree = () => {
    let url = ''
    if (!branch||urlSwagger?.includes('.')) {
      return
    } else {
      if(urlSwagger==='上一个目录'){
        parentTreeArr.pop()
      }else{
        parentTreeArr.push(urlSwagger)
      }
      url = `/storage/dsm-swagger/-/refs/${branch}/logs_tree/${encodeURIComponent(parentTreeArr.join('/'))}?format=json&offset=0`
    }
    fetch(url, {
      method: 'GET',
      params: {
        format: 'json',
        offset: 0
      }
    }).then((promise => {
      return promise.json()
    })).then((res => {
      let _logsTree = res.filter((o) => {
        return o.file_name.includes('.yaml') || !o.file_name.includes('.')
      }).map((o) => {
        return {value: o.file_name, label: `${parentTreeArr.join('/')}/${o.file_name}`}
      })

      urlSwagger && _logsTree.unshift({
        value: '上一个目录',
        label: parentTreeArr.join('/'),
      })
      
      setLogsTree(
        _logsTree
      )
      console.log(res)
    }));
  }
  
  useEffect(()=>{
    loadLogsTree()
  }, [branch, urlSwagger])
  
  useEffect(()=>{
    fetch('/api/v4/projects/464/repository/branches?search=&per_page=20&sort=updated_desc', {
      method: 'GET',
      params: {
        format: 'json',
        offset: 0
      }
    }).then((promise => {
      return promise.json()
    })).then((res => {
      console.log(res)
      setBranchOptions(
        res.map((o) => {
          return {value: o.name, label: o.name}
        })
      )
    }));
  },[])

  const changeBranch = (e: any)=>{
    setBranch(e)
    // loadLogsTree()
    // form.submit()
  }
  
  const changeUrlSwagger = (e: any)=>{
    // urlSwagger = e.target.value
    setUrlSwagger(e)
    // loadLogsTree()
  }
  
  const reload = (params: any) => {
    if (location.search === `?${createSearchParams(params).toString()}`) {
      // location.reload()
    } else {
      location.hash = ''
      location.search = `?${createSearchParams(params).toString()}`  
    }
  }
  
  // const requestInterceptorReact = (requestObj: any) => {
  //   requestObj.headers['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
  //   requestObj.headers['Cache-Control'] = 'no-cache';
  //   requestObj.headers['Pragma'] = 'no-cache';
  // 
  //   if(requestObj.url!=`/hui3.wang/swagger-view/-/raw/${branch}/${urlSwagger}`)
  //     requestObj.url = `${requestObj.url}?random=${random}`
  // }

  return (
    <div>
      <Space className={'swagger-ui-ln'}>
        <Form 
          form={form}
          onFinish={reload} 
          layout={'inline'} 
          name="basic"
          initialValues={{
            branch,
            urlSwagger
          }}
        >
          <Form.Item label={'分支名'} name={'branch'}>
            {/*<Input onChange={changeBranch} style={{width: '160px'}}/>*/}
            <Select onChange={changeBranch} options={branchOptions} style={{width: '160px'}} placeholder={'请选择分支'}/>
          </Form.Item>
          <Form.Item label={'资源路径'} name={'urlSwagger'}>
            {/*<Select onChange={changeUrlSwagger} options={logsTree} style={{width: '660px'}} placeholder={'请选择分支'}/>*/}
            <Input onChange={changeUrlSwagger} style={{width: '500px'}}/>
          </Form.Item>
          <Button htmlType="submit" type={'primary'}>读取加载</Button>
        </Form>
      </Space>
      {branch&&urlSwagger?.includes('.')?<div style={{overflow: 'auto', height: 'calc(100vh - 58px)', marginTop: '10px'}}>
        {/*<SwaggerUI spec={SwaggerJson} docExpansion={"none"} deepLinking={true}/>*/}
        <SwaggerUI url={`/storage/dsm-swagger/-/raw/${branch}${parentTreeArr.join('/')}/${urlSwagger}`} docExpansion={"none"} deepLinking={true}/>
      </div>:null}
    </div>
  );
}

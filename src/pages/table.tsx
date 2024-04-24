import { Space, Form, Select, Table, Spin } from 'antd';
import React, {useEffect, useState} from 'react';
import { history, useSearchParams } from 'umi';
import SwaggerUI from 'swagger-ui-react';
import styles from './swagger-ui-ln.less';
import "./swagger-ui.css"
import SwaggerJson from './swagger.json'

import moment from 'moment'

let parentTreeArr = []
export default function HomePage() {
  const [form] = Form.useForm();
  const location= window.location
  const [searchParams, setSearchParams] = useSearchParams();
  const branch = searchParams.get('branch')
  const urlSwaggerStr = searchParams.get('urlSwagger')
  const urlSwagger = urlSwaggerStr?.split('/')||[]
  const fileSwagger = searchParams.get('fileSwagger')
  const [random, setRandom] = useState(Math.random());
  const [branchOptions, setBranchOptions] = useState([]);
  const [logsTree, setLogsTree] = useState([]);
  
  const [spinning, setSpinning] = useState(false);

  const iframeUrl = `${branch}/${searchParams.get('urlSwagger')||''}/${searchParams.get('fileSwagger')}`;
  
  const changeUrlSwagger = (e: any)=>{
    if(spinning||searchParams.get('urlSwagger')?.includes('.')){
      return
    }
    const _searchParams: any = {
      branch,
    }
    if(e.includes('.')){
      urlSwagger.length && (_searchParams.urlSwagger = urlSwagger.join('/'))
      _searchParams.fileSwagger = e
    }else{
      setSpinning(true)
      if(e==='上一个目录'){
        urlSwagger.pop()
      }else{
        e&&urlSwagger.push(e)
      }
      urlSwagger.length && (_searchParams.urlSwagger = urlSwagger.join('/'))
    }
    setSearchParams(_searchParams)
  }
  
  const columns = [
    {
      title: 'Name',
      dataIndex: 'file_name',
      key: 'name',
      render: (text, record) => <a onClick={()=>changeUrlSwagger(text)}>{text}</a>,
    },
    {
      title: 'Committer',
      dataIndex: ['commit', 'committer_name'],
      key: 'committer_name',
    },
    {
      title: 'Date',
      dataIndex: ['commit', 'committed_date'],
      key: 'committed_date',
      render: (text, record) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];
  
  const loadLogsTree = () => {
    let url = ''
    if (branch&&!urlSwagger?.includes('.')) {
      url = `/storage/dsm-swagger/-/refs/${branch}/logs_tree/${urlSwagger.join('/')}?format=json&offset=0`
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
        })

        urlSwagger.length && _logsTree.unshift({
          file_name: '上一个目录',
        })

        setLogsTree(
          _logsTree
        )
      })).finally(()=>{
        setSpinning(false)
      });
    }
  }
  
  useEffect(()=>{
    branch&&loadLogsTree()
  }, [branch, urlSwaggerStr])
  
  useEffect(()=>{
    setSpinning(true)
    fetch('/api/v4/projects/464/repository/branches?search=&per_page=20&sort=updated_desc', {
      method: 'GET',
      params: {
        format: 'json',
        offset: 0
      }
    }).then((promise => {
      return promise.json()
    })).then((res => {
      setBranchOptions(
        res.map((o) => {
          return {value: o.name, label: o.name}
        })
      )
    })).finally(()=>{
      setSpinning(false)
    });
  },[])

  const changeBranch = (e: any)=>{
    reload({branch: e})
  }
  
  const reload = (params: any) => {
    setSearchParams(params)
  }
  
  /*const requestInterceptorReact = (requestObj: any) => {
    requestObj.headers['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
    requestObj.headers['Cache-Control'] = 'no-cache';
    requestObj.headers['Pragma'] = 'no-cache';

    if(requestObj.url!=`/hui3.wang/swagger-view/-/raw/${branch}/${urlSwagger}`)
      requestObj.url = `${requestObj.url}?random=${random}`
  }*/

  const fileDirClick = (urlSwagger) => {
    let _searchParams: any = {
      branch
    }
    urlSwagger&&(_searchParams = {
      branch,
      urlSwagger,
    })
    setSearchParams(_searchParams)
  }
  
  return (
    <Spin spinning={spinning}>
      <div className={styles.swaggerUiContainer}>
        <div className={styles.swaggerUiTop}>
          <Space className={styles.swaggerUiLn}>
            <Form 
              form={form}
              onFinish={reload} 
              layout={'inline'} 
              name="basic"
              initialValues={{
                branch: searchParams.get('branch'),
              }}
            >
              <Form.Item label={'分支名'} name={'branch'}>
                <Select onChange={changeBranch} options={branchOptions} style={{width: '160px'}} placeholder={'请选择分支'}/>
              </Form.Item>
            </Form>
            <div>
              {branch && <span>
                <a onClick={() => {
                  fileDirClick('')
                }}>{branch}</a> /
              </span>}
              {urlSwagger.map((o, index) => {
                return <span key={o}> <a onClick={() => {
                  fileDirClick(urlSwagger.slice(0, index+1).join('/'))
                }} className={styles.swaggerFileDir}>{o}</a> / </span> 
              })}
              <span>{fileSwagger}</span>
            </div>
          </Space>
          <Table rowKey={'file_name'} className={styles.swaggerUiTable} dataSource={logsTree} columns={columns} pagination={false} scroll={{ y: 180 }} />
        </div>
        {searchParams.get('fileSwagger')?<div className={styles.swaggerUiMain}>
          {/*<SwaggerUI spec={SwaggerJson} docExpansion={"none"} deepLinking={true}/>*/}
          <iframe className={styles.swaggerUiIframe} src={`?${iframeUrl}/#/swagger-ui?url=/storage/dsm-swagger/-/raw/${iframeUrl}`}/>
        </div>:null}
      </div>
    </Spin>
  );
}

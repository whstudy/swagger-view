import { Space, Form, Select, Table, Spin } from 'antd';
import React, {useEffect, useState} from 'react';
import { history, useSearchParams } from 'umi';
import styles from './swagger-ui-ln-new.less';
import "./swagger-ui.css"
import fileSVG from '/src/assets/file.svg';
import folderSVG from '/src/assets/folder.svg';
import InfiniteScroll from 'react-infinite-scroll-component';

let offset = 0
let logsTreeOffset = []
export default function HomePage() {
  
  const projectMap = {
    deploy: {
      url: `/swagger/deploy-swagger/`,
      branchApiUrl: `/api/v4/projects/486/repository/branches?search=&per_page=20&sort=updated_desc`
    },
    dsm: {
      url: `/swagger/dsm-swagger/`,
      branchApiUrl: `/api/v4/projects/464/repository/branches?search=&per_page=20&sort=updated_desc`
    },
  }
  
  const [form] = Form.useForm();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const project = searchParams.get('project')
  const branch = searchParams.get('branch')
  const urlSwaggerStr = searchParams.get('urlSwagger')
  const urlSwagger = urlSwaggerStr?.split('/')||[]
  const fileSwagger = searchParams.get('fileSwagger')
  const [random, setRandom] = useState(Math.random());
  const [projectOptions, setProjectOptions] = useState([
    {label:`安装部署`, value: `deploy`},
    {label:`管控面`, value: `dsm`},
  ]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [logsTree, setLogsTree] = useState([]);
  
  const [spinning, setSpinning] = useState(false);

  const iframeUrl = `${branch}/${searchParams.get('urlSwagger')||''}/${searchParams.get('fileSwagger')}`;
  
  const changeUrlSwagger = (e: any)=>{
    if(spinning||searchParams.get('urlSwagger')?.includes('.')){
      return
    }
    const _searchParams: any = {
      project,
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
      render: (text, record) => {
        return (<div className={styles.fileName}>
          {text.includes('.yaml') ? <img className={styles.fileSVG} src={fileSVG}/> : <img className={styles.folderSVG} src={folderSVG}/>}
          <a onClick={() => changeUrlSwagger(text)}>{text}</a>
        </div>)
      },
    },
  ];
  
  const loadLogsTree = () => {
    if(offset == -1){
      setSpinning(false)
      return
    }
    let url = ''
    if (branch&&!urlSwagger?.includes('.')) {
      url = `${projectMap[project].url}-/refs/${branch}/logs_tree/${urlSwagger.join('/')}?format=json&offset=${offset}`
      fetch(url, {
        method: 'GET',
        params: {
          format: 'json',
          offset: offset
        }
      }).then((promise => {
        return promise.json()
      })).then((res => {
        let _logsTree = res.filter((o) => {
          return o.file_name.includes('.yaml') || !o.file_name.includes('.')
        })
        
        if (!offset) {
          urlSwagger.length && _logsTree.unshift({
            file_name: '上一个目录',
          })
        } else {
          _logsTree = [
            ...logsTreeOffset,
            ..._logsTree
          ]
        }
        setLogsTree(
          _logsTree
        )
        logsTreeOffset = _logsTree
        if(res.length==25){
          offset = offset +25
        }else{
          offset = -1
        }
      })).finally(()=>{
        setSpinning(false)
      });
    }
  }

  const loadBranch = () => {
    setSpinning(true)
    fetch(projectMap[project].branchApiUrl, {
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
  }
  
  useEffect(()=>{
    if(project) {
      offset = 0
      logsTreeOffset = []
      loadBranch()
    }
    if(branch){
      offset = 0
      logsTreeOffset = []
      loadLogsTree()  
    }
  }, [branch, urlSwaggerStr, project])

  const changeValues = (values: any, allValues)=>{
    reload(allValues)
  }
  
  const reload = (params: any) => {
    !params.branch && delete params.branch
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
      branch,
      project,
    }
    urlSwagger&&(_searchParams = {
      branch,
      project,
      urlSwagger,
    })
    setSearchParams(_searchParams)
  }
  
  return (
    <Spin spinning={spinning}>
      <div className={styles.swaggerUiContainer}>
        <div id={`scrollableDiv`} className={styles.leftSwagger}>
          <InfiniteScroll
            dataLength={logsTree.length} //This is important field to render the next data
            next={loadLogsTree}
            hasMore={offset!==-1}
            scrollableTarget="scrollableDiv"
          >
              <Table rowKey={'file_name'} className={styles.swaggerUiTable} dataSource={logsTree} columns={columns} pagination={false} />
          </InfiniteScroll>
        </div>
        <div className={styles.rightSwagger}>
          <div className={styles.swaggerUiTop}>
            <Space className={styles.swaggerUiLn}>
              <Form
                onValuesChange={changeValues}
                form={form}
                onFinish={reload}
                layout={'inline'}
                name="basic"
                initialValues={{
                  project: searchParams.get('project'),
                  branch: searchParams.get('branch'),
                }}
              >
                <Form.Item label={'切换项目'} name={'project'}>
                  <Select options={projectOptions} style={{width: '160px'}} placeholder={'请选择分支'}/>
                </Form.Item>
                <Form.Item label={'分支名'} name={'branch'}>
                  <Select showSearch options={branchOptions} style={{width: '160px'}} placeholder={'请选择分支'}/>
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
          </div>
          <div className={styles.swaggerUiBottom}>
            {searchParams.get('fileSwagger')?<div className={styles.swaggerUiMain}>
              <iframe className={styles.swaggerUiIframe} src={`?${iframeUrl}/#/swagger-ui?url=${projectMap[project].url}-/raw/${iframeUrl}`}/>
            </div>:null}
          </div>
        </div>
      </div>
    </Spin>
  );
}

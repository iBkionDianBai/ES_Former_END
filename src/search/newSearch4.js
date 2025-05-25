//秦本纪检索
import axios from 'axios'
import {Helmet} from 'react-helmet';
import {Button, Card, Descriptions, Form, Input, message, Select, Space, Table, Upload} from 'antd'
import React, {useEffect, useState} from 'react'
import './newSearch.css'
import Header from "../page/header";
import loginBackground from '../image/bg1.jpg'
import {InboxOutlined} from "@ant-design/icons";

const {Dragger} = Upload;

function NewSearchPage4() {
    useEffect(() => {
        // 初始化操作，判断是否登录
        console.log(sessionStorage.getItem('token'));
        if (sessionStorage.getItem('token') == null) {
            navigate("/");
        }
    }, []);
    const [name, setName] = useState('')
    // 这里存的是列表s数据
    const [list, setList] = useState([])
    const [input, setInput] = useState('')
    const [selected, setSelected] = useState('all')
    // 这里是列表的目录
    const columns = [
        {
            // title是前端展示出来的表头名称
            title: '纪年',
            // dataIndex,key要和后端返回的字段对应上
            dataIndex: 'jinian',
            key: 'jinian',
            // 这里是渲染返回，就是表格里填什么
            render: (_, {jinian}) => {
                return (jinian || "").split(new RegExp(`(${input})`, "gi")).map((c, i) => c === input ?
                    <mark key={i}>{c}</mark> : c) || '-'
            },
            // ellipsis这个属性是字段过长会自动隐藏
            ellipsis: true,
            width: 200,
            align: 'center',
            sorter:(a,b)=>a.jinian.localeCompare(b.jinian)
        },
        {
            title: '文本',
            dataIndex: 'wenben',
            key: 'wenben',
            render: (_, {wenben}) => {
                let s = (wenben || "").split(new RegExp(`(${input})`, "gi")).map((c, i) => c === input ?
                    <mark key={i}>{c}</mark> : c) || '-'
                return <div style={{whiteSpace: 'pre-line'}}>{s}</div>
            },
            ellipsis: true,
            width: 500,
            align: 'center',
            sorter:(a,b)=>a.wenben.localeCompare(b.wenben)
        },
        {
            title: '操作',
            dataIndex: 'operation',
            key: 'operation',
            ellipsis: true,
            align: 'center',
            // fixed: 'right',
            width: 260,
            render: (text, record) => (  // render 返回一个组件
                <Space size="middle" style={{textAlign: "center", width: 260}}>
                    {/*<Button className='count' type='primary' >查看</Button>*/}
                    <Button onClick={(value) => watch(record)}
                            style={{
                                backgroundColor: 'rgba(150, 122, 91, 0.87)',
                                primaryColor: 'black',
                                fontWeight: 1000,
                                width: 65
                            }}>
                        查看
                    </Button>
                    <Button onClick={(value) => show(record)}
                            style={{
                                backgroundColor: 'rgba(150, 122, 91, 0.87)',
                                primaryColor: 'black',
                                fontWeight: 1000,
                                width: 65
                            }}>
                        修改
                    </Button>
                    <Button onClick={(value) => del(record.id)}
                            style={{
                                backgroundColor: 'rgba(150, 122, 91, 0.87)',
                                primaryColor: 'black',
                                fontWeight: 1000,
                                width: 65
                            }}>
                        删除
                    </Button>
                </Space>
            )
        }
    ]
    const onFinish = async () => {
        if (selected == 'all') {
            console.log(selected, input)
            const data = {
                pageNum: 0,
                pageSize: 20,
                payload: {"keyword": input}
            }
            axios.defaults.headers["Content-Type"] = "application/json";
            axios.post('http://172.18.7.119:8080/QshBenJiWenXian/fullTextSearch', data)
                .then(response => {
                    console.log(response, 'resres')
                    setList(response.data.data.payload || [])
                    if (response.data.data.payload.length === 0) {
                        alert('暂无相关数据')
                    }
                })
                .catch(error => {
                    console.error(error)
                })
        } else {
            const values = {[selected]: input}
            console.log(values)
            const data = {
                pageNum: 1,
                pageSize: 1000,
                payload: values
            }
            axios.defaults.headers["Content-Type"] = "application/json";
            axios.post('http://172.18.7.119:8080/QshBenJiWenXian/select', data)
                .then(response => {
                    console.log(response, 'resres')
                    setList(response.data.data.rows || [])
                    if (response.data.data.payload.length === 0) {
                        alert('暂无相关数据')
                    }
                })
                .catch(error => {
                    console.error(error)
                })
        }
    }

    const onReset = () => {
        setName('')
        setList([])
    }
    const [showElem, setShowElem] = useState(true)
    const [form] = Form.useForm();
    const [update_data, setUpdate_data] = useState({})
    let new_data = update_data
    const [messageApi, contextHolder] = message.useMessage();

    const show = (value) => {
        setShowElem(false)
        setUpdate_data(value)
        console.log(value)
    }
    const [showWatch, setShowWatch] = useState(true)
    const watch = (value) => {
        setShowWatch(false)
        setUpdate_data(value)
    }
    const update = () => {
        axios.defaults.headers["Content-Type"] = "application/json";
        console.log(new_data)
        axios.put('http://172.18.7.119:8080/QshBenJiWenXian', new_data)
            .then(response => {
                // messageApi.info('修改成功')
                console.log(response, 'resres')
            })
            .catch(error => {
                console.error(error)
            })
        setShowElem(true)
    }

    const del = (id) => {
        axios.defaults.headers["Content-Type"] = "application/json";
        console.log(id)
        axios.delete(`http://172.18.7.119:8080/QshBenJiWenXian/${id}`)
            .then(response => {
                console.log(response)
                if (response.data.code){ message.success('数据删除成功')}
                onFinish()
            })
            .catch(error => {
                console.error(error)
            })
    }
    // 新增单条数据
    let add_data = {}
    const [showSingleAdd, setShowSingleAdd] = useState(true)
    const [showAdd, setShowAdd] = useState(true)
    const addSingle = () => {
        console.log([add_data])
        axios.post('http://172.18.7.119:8080/QshBenJiWenXian', [add_data])
            .then(response => {
                console.log(response)
                if (response.data.code){ message.success('数据添加成功')}
            })
            .catch(error => {
                console.error(error)
            })
        setShowSingleAdd(true)
    }

    // 下载模板
    const downloadFile = () => { //fileurl文件地址（一般是接口返回）
        let fileurl = '/本纪文献表信息模板.xlsx'
        let filename = '本纪文献表信息模板.xlsx'
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = fileurl;
        a.download = filename || ""; //需要把这行加上，告诉浏览器是下载行为 ,可以传空
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        // axios.get('http://172.18.7.119:8080/QshBenJiWenXian')
        //     .then(response => {
        //         let blob = new Blob([response], {type: "xlsx"});
        //         let url = (URL || '').createObjectURL(blob);
        //         // setShowElem(true)
        //         // messageApi.info('删除成功')
        //         console.log(url)
        //     })
        //     .catch(error => {
        //         console.error(error)
        //     })
    };

    // 上传文件
    const props = {
        name: 'multipartFile',
        multiple: false,
        action: 'http://172.18.7.119:8080/QshBenJiWenXian/upload',
        onChange(info) {
            const {status} = info.file;
            let tmpFile = info.file;
            let type = tmpFile.name.substring(tmpFile.name.lastIndexOf('.') + 1)
            if (-1 === 'xlsx'.indexOf(type)) {
                message.error('上传文件不符合格式！');
                return;
            } else {
                if (status !== 'uploading') {
                    console.log(info.file, info.fileList);
                    // upload_file = info.file
                    // console.log(upload_file)
                }
                if (status === 'done') {
                    message.success(`${info.file.name} 文件上传成功！`);
                } else if (status === 'error') {
                    message.error(`${info.file.name} 文件上传成功！`);
                }
            }
            console.log(info)
        },
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },
        // 查看上传的文件
        // beforeUpload(file) {
        //     axios.post('http://172.18.7.119:8080/QshBenJiWenXian/upload', file)
        //         .then(response => {
        //             // setShowElem(true)
        //             // messageApi.info('删除成功')
        //             // console.log(response)
        //         })
        //         .catch(error => {
        //             console.error(error)
        //         })
        //     const reader = new FileReader();
        //     reader.readAsText(file, 'gbk');
        //     reader.onload = (result) => {
        //         console.log(result.target.result)
        //     }
        //     return false;
        // }
    };


    return (
        <div className="page">
            <Helmet>
                <title>秦本纪数据库</title>
            </Helmet>
            <Header/>
            <div className="auth_bg">
                <img id="bannerbox" src={loginBackground} alt=""/>
            </div>
            <div className="content"
                 style={{display: (showElem && showWatch && showAdd && showSingleAdd) ? 'block' : 'none'}}>
                <div className="searchContainer">
                    <Form className="basic" onFinish={onFinish} onReset={onReset}>
                        {/*<Form.Item>*/}
                        <Space wrap>
                            <Select
                                defaultValue="all"
                                style={{
                                    width: 120,
                                }}
                                onChange={(value) => {
                                    setSelected(value)
                                }}
                                options={[
                                    {
                                        value: 'all',
                                        label: '全部字段',
                                    },
                                    {
                                        value: 'jinian',
                                        label: '纪年',
                                    },
                                    {
                                        value: 'wenben',
                                        label: '文本',
                                    }
                                ]}
                            />

                            <Input
                                style={{width: 200,}}
                                onChange={(value) => {
                                    setInput(value.currentTarget.value)
                                }}/>
                            <Button htmlType="submit"
                                    style={{backgroundColor: 'rgba(150, 122, 91, 0.87)', fontWeight: 1000}}>
                                搜索
                            </Button>
                            <Button htmlType="reset"
                                    style={{backgroundColor: 'rgba(150, 122, 91, 0.87)', fontWeight: 1000}}>
                                重置
                            </Button>
                            <Button style={{backgroundColor: 'rgba(150, 122, 91, 0.87)', fontWeight: 1000}}
                                    onClick={() => {
                                        setShowAdd(false)
                                    }}>
                                新增数据
                            </Button>
                        </Space>
                        {/*<Button>*/}
                        {/*    <Link to="/gaojilink">*/}
                        {/*        高级搜索*/}
                        {/*    </Link>*/}
                        {/*</Button>*/}
                        {/*</Form.Item>*/}
                    </Form>
                </div>
                <div>
                </div>
                <div className="searchResult">
                    <Table
                        style={{textAlign: "center"}}
                        columns={columns}
                        dataSource={list}
                    />
                </div>
            </div>
            <Card size="lage" title="修改页面" extra={<Button
                style={{backgroundColor: 'rgba(150, 122, 91, 0.87)', primaryColor: 'black', fontWeight: 1000}}
                onClick={() => {
                    setShowElem(true)
                }}>退出</Button>}
                  style={{
                      display: showElem ? 'none' : 'block',
                      width: 500,
                      marginLeft: "30%",
                      zIndex: 100,
                      marginBottom: 20
                  }}>
                <Form
                    form={form}
                    name="control-hooks"
                    style={{width: 400}}
                >
                    <Form.Item
                        name='jinian'
                        label='纪年'
                    > <Input placeholder={update_data.jinian}
                             onChange={(value) => {
                                 new_data.jinian = value.target.value
                             }}
                    /> </Form.Item>
                    <Form.Item
                        name='wenben'
                        label='文本'
                    > <Input placeholder={update_data.wenben}
                             onChange={(value) => {
                                 new_data.wenben = value.target.value
                             }}
                    /> </Form.Item>
                    <Form.Item>
                        <Button onClick={update}
                                style={{
                                    backgroundColor: 'rgba(150, 122, 91, 0.87)',
                                    primaryColor: 'black',
                                    fontWeight: 1000,
                                    marginTop: 20,
                                    marginLeft: '45%'
                                }}>
                            确定
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
            <Card size="lage" title="查看页面" extra={<Button
                style={{backgroundColor: 'rgba(150, 122, 91, 0.87)', primaryColor: 'black', fontWeight: 1000}}
                onClick={() => {
                    setShowWatch(true)
                }}>退出</Button>}
                  style={{
                      display: showWatch ? 'none' : 'block',
                      width: 1400,
                      marginLeft: "10%",
                      zIndex: 100,
                      marginBottom: 20
                  }}>
                <Descriptions title="秦始皇本纪文">
                    <Descriptions.Item label="纪年">{update_data.jinian}</Descriptions.Item>
                    <Descriptions.Item label="文本">{update_data.wenben}</Descriptions.Item>
                </Descriptions>
            </Card>
            <Card size="lage" title="单条信息新增页面" extra={<Button
                style={{backgroundColor: 'rgba(150, 122, 91, 0.87)', primaryColor: 'black', fontWeight: 1000}}
                onClick={() => {
                    setShowSingleAdd(true)
                    setShowAdd(false)
                }}>退出</Button>}
                  style={{
                      display: showSingleAdd ? 'none' : 'block',
                      width: 500,
                      marginLeft: "30%",
                      zIndex: 100,
                      marginBottom: 20
                  }}>
                <Form form={form} name="control-hooks" style={{width: 400}}>
                    <Form.Item
                        name='jinian'
                        label='纪年'
                    > <Input onChange={(value) => {
                        add_data.jinian = value.target.value
                    }}
                    /> </Form.Item>
                    <Form.Item
                        name='wenben'
                        label='文本'
                    > <Input onChange={(value) => {
                        add_data.wenben = value.target.value
                    }}
                    /> </Form.Item>
                    <Form.Item>
                        <Button onClick={addSingle}
                                style={{
                                    backgroundColor: 'rgba(150, 122, 91, 0.87)',
                                    primaryColor: 'black',
                                    fontWeight: 1000,
                                    marginTop: 20,
                                    marginLeft: '45%'
                                }}>
                            确定
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            {/*批量上传*/}
            <Card extra={<Button
                style={{backgroundColor: 'rgba(150, 122, 91, 0.87)', primaryColor: 'black', fontWeight: 1000}}
                onClick={() => {
                    setShowAdd(true)
                }}>退出</Button>}
                  style={{display: showAdd ? 'none' : 'block', width: 1000, marginLeft: "10%", height: 420}}>

                <Dragger {...props} style={{marginTop: 20}}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined/>
                    </p>
                    <p className="ant-upload-text">点击或者拖拽文件到这个区域</p>
                    <p className="ant-upload-hint">请先下载模板文件，然后在模板文件中填写信息后再上传该文件</p>
                    <p className="ant-upload-hint">批量导入的数据必须要从标题下面一行开始，一行挨着一行。（否则会导致插入的数据混乱）</p>
                </Dragger>

                <Space style={{position: 'absolute', top: 350, width: 1000, height: 50, zIndex:1}}>
                    <Button onClick={downloadFile}
                            style={{backgroundColor: 'rgba(150, 122, 91, 0.87)', fontWeight: 1000, marginLeft: 50}}>
                        下载模板
                    </Button>
                    <Button onClick={() => {
                        setShowSingleAdd(false)
                        setShowAdd(true)
                    }}
                            style={{backgroundColor: 'rgba(150, 122, 91, 0.87)', fontWeight: 1000, marginLeft: "30%"}}>
                        添加单条数据
                    </Button>
                </Space>
            </Card>

            {/* Add other content */}
        </div>

    )

}

export default NewSearchPage4

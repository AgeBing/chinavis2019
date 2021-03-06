import React from 'react'
import { DragSource,DropTarget } from 'react-dnd'
import ItemType from './ItemType'
import { connect } from 'react-redux'

import { Button,Icon,Tag,Popover } from 'antd';

import { nodeRectWidth,nodeRectHeight } from './Config'

import PieChart from './PieChart'
import StackChart from './StackChart'
import UserList from './List'



import { API_Traj_Info }  from '../../api/index'

const style = {
  width: nodeRectWidth,
  height: nodeRectHeight
}

const popStyle ={
  height : 280,
  width  : 460
}

let  pieContent = (
  <div style={popStyle}>
  </div>
);



class Node extends React.Component{
  constructor() {
    super(...arguments)
    this.state = {
        currentVisItem : 'none' ,
        summary:{},
        popContent:pieContent,
        userLength:0 ,
        sendingFLag:false,
    }
  }

  componentWillMount(){


  }
  componentWillReceiveProps(nextProps){
      let { condition } =  this.props,
          { nextCondition } = nextProps
      if(!condition || !nextCondition ) return

      if( condition.day != nextCondition.day ||
          condition.roomsId.toString() != nextCondition.roomsId.toString() ||
          condition.time.startMinites != nextCondition.time.startMinites ||
          condition.time.endMinites != nextCondition.time.endMinites  ){
        console.log(condition,nextCondition)
        this.getSummaryInfo(nextProps)
      }

  }
  showConditions(){
    let { condition,ifChoosen,selectIdsGlobal } = this.props
    let show = []
    let hasUids = condition.hasOwnProperty('uids')
    let hasRids = condition.hasOwnProperty('rooms')

    if(!hasUids ){
      this.getSummaryInfo()
    }


    let userCountDOM = ''

    if( ifChoosen && selectIdsGlobal.length != 0 ){
        userCountDOM =(
          <Tag key={'users'}
            onClick={this.onHandleShowOrHidePop.bind(this,'users-count')}>
            <Icon type="user" /> 
            {selectIdsGlobal.length}
          </Tag>
        )
    }

    show.push( 
      <div className='cond-line' key={'user'}>
        <Tag key={'users'}
          onClick={this.onHandleShowOrHidePop.bind(this,'users')}>
          <Icon type="team" /> 
          {hasUids ?condition['uids'].length : this.state.userLength}
        </Tag>
        {userCountDOM}
      </div>
    )


    if( condition['time'] ){
      let day = condition['day']
      show.push(
          <Tag className='cond-line' key={'time'+day} >
            <Icon type="clock-circle" /> 
            {' '}D{day}|{condition['time']['startTime']}~{condition['time']['endTime']}
          </Tag>
      )
      
    }

    if(hasRids){

      // 展示分割
      let roomsStr = ' ',
          maxSL = 9
      condition['rooms'].forEach((room,i)=>{
         roomsStr += (room + ' ')
      })
      if(roomsStr.length > maxSL){
        roomsStr = roomsStr.slice(0,maxSL)
        roomsStr += '...'
      }

      if( condition['rooms'] && condition['rooms'].length > 0){
            show.push(
                <Tag className='cond-line' key={'rooms'}
                onClick={this.onHandleShowOrHidePop.bind(this,'rooms')}  >
                      <Icon type="home" />  
                      {roomsStr}
                </Tag>
            )
      }
    }

    if( show.length == 0){
          show.push(
            <span>无条件</span>
          )
    }
    return show
  }

  getSummaryInfo(nextProps){
    
    // 会发送两次
    
    if(this.state.sendingFLag) return
    this.setState({
      sendingFLag : true
    })

    let { condition } = nextProps || this.props
   
    let startMiniter  = condition.time.startMinites,
        endMiniter    = condition.time.endMinites,
        day           = condition.day,
        rids = condition['roomsId']

    API_Traj_Info({
      startMiniter,endMiniter,day,rids
    }).then((res)=>{

        this.setState({
          summary : res,
          userLength: res['length'],
          sendingFLag : false,
          uids:res['uids']
        })
        condition['uids'] = res['uids']
    })



  }
  render(){
    const {
      hideSourceOnDrag,
      x,
      y,
      delFlag,
      chaFlag,
      ifChoosen,
      connectDragSource,
      connectDropTarget,
      isOver,
      isDragging,
      children,
      id,
      handleNodeAdd,
      condition,
      selectIdsGlobal
    } = this.props

    let nodeClassName = ''

    if(ifChoosen){
      nodeClassName += 'node-rect node-rect-choosen'
    }else{
      nodeClassName += 'node-rect'
    }
    if(isOver){
      nodeClassName += ' node-rect-over'
    }


    if (isDragging && hideSourceOnDrag) {
      return null  // 不显示 否则会有拖影
    }
    return connectDropTarget(connectDragSource(

      <div 
        className={nodeClassName}
        style={Object.assign({}, style, { 'left':x, 'top':y })}>

      <Popover
        content={this.state.popContent}
        visible={this.state.currentVisItem != 'none' }
        onVisibleChange={this.handleVisibleChange}
        placement="right"
      >
        <div className='conditions-contain'>
              {this.showConditions()}
        </div>


        <div className="config-contain">
          <div className='config-box'>
            <Button icon="minus-circle"  
              onClick={this.onHandleDel.bind(this)}
              disabled={delFlag}/>
          </div>
          <div className='config-box'>
            <Button icon="tool" 
              onClick={this.onHandleConditionChange.bind(this)}
              disabled={chaFlag || this.props.condition['rooms'].length == 0} />
          </div>
          <div className='config-box'>
            <Button icon={!this.state.sendingFLag?"swap":'loading'}
               onClick={this.onHandleChangeState.bind(this)}
               disabled={ifChoosen || !this.props.condition.hasOwnProperty('time')} />
          </div>
        </div>
      </Popover>

      </div>

    ))
  }
  onHandleConditionChange(){
      let { handleConditionChange,id }  = this.props
      handleConditionChange(id)
  }

  onHandleDel(){
      let { handleNodeDel,id }  = this.props
      handleNodeDel(id)
  }
  onHandleChangeState(){
      let { handleStateChage,id }  = this.props
      handleStateChage(id)
  }

  onHandleShowOrHidePop(type){

    let { summary,currentVisItem } = this.state

    let newPopContent ,newVisItem

    if(Object.keys(this.state.summary).length == 0  && this.props.condition['uids'].length == 0)  return

    if( type == currentVisItem ){
      newVisItem = 'none'
    }else{
      newVisItem = type
    }

    
    if(newVisItem == 'none'){
      newPopContent = ( <div></div> )
    }else{
      switch(type){
        case "rooms":
          newPopContent =  (
            <div style={popStyle}>
                <StackChart  rooms={summary.rooms} style={popStyle}/>
            </div>
          );
          break;
        
        case "users":
          newPopContent =  (
            <div style={popStyle}>
                {/*<PieChart  counts={summary.user} style={popStyle}/>*/}
                <UserList uids={this.state.uids || this.props.condition['uids']}/>
            </div>
          );
          break;

        case "users-count":
          newPopContent =  (
            <div style={popStyle}>
                {/*<PieChart  counts={summary.user} style={popStyle}/>*/}
                <UserList uids={this.props.selectIdsGlobal}/>
            </div>
          );
          break;
      }
    }
    this.setState({
      popContent:newPopContent,
      currentVisItem:newVisItem
    })
  }
  highLight(){
    this.setState({
      ifChoosen:true
    })
    console.log('choose')
  }

}


const type = ItemType.BOX

const sourceSpec =  {
    beginDrag(props) {   // Required  
      const { id, x, y } = props   // component's current props
      return { id, x, y }    // 返回的 obj 会传给 dropTarget 
    },
}
const targetSpec =  {
  drop(props, monitor, component) {   // called when a item is dropped on target
    if (!component) {   //该组件的实例     
      return null
    }
    const item = monitor.getItem()   //  获取 drag 对象 ，来自与 dragsource 的 beginDrag的返回    // monitor 为 DropTargetMonitor 的实例
    const delta = monitor.getDifferenceFromInitialOffset()
    let aId = item.id,
        bId = component.props.id 

    component.props.handleUnionTwoNode(aId,bId)
  },

  hover(props, monitor, component) { 
    if (!component) {     
      return null
    }
  },
}

// pass dragging state to  component 
function drag_collect( connect , monitor ){
  return {
    connectDragSource: connect.dragSource(),   // 到 props, 然后在 render 里面包裹 dom ; 
    // connect this source DOM to Dnd backend   ; connectDragSource 的 实例
    isDragging: monitor.isDragging(),
    //  DragSourceMonitor 的 实例 ； 获取当前 state 
  }
} 
function drop_collect( connect ,monitor ){
  return {
    connectDropTarget: connect.dropTarget(),
    isOver:monitor.isOver(),

  }
} 


const mapStateToProps = (state) => {
  return {
    selectIdsGlobal: state.selectIdsGlobal,
    stateNodeId : state.stateNodeId,
  }
}


export default 
  connect(mapStateToProps)(
  DropTarget(type , targetSpec , drop_collect )(
    DragSource( type , sourceSpec , drag_collect)(Node)
  ))
// https://github.com/react-dnd/react-dnd/issues/157


require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
import ReactDOM from 'react-dom';

//获取图片相关数据
let imageDatas = require('../data/imageDatas.json');
//利用自执行函数，将图片名信息转成图片URL路径信息
imageDatas = (function genImageURL (imageDatasArr) {
  for (var i = 0, j = imageDatasArr.length; i < j; i++) {
    let singleImageData = imageDatasArr[i];

    singleImageData.imageURL = require('../images/' + singleImageData.fileName);

    imageDatasArr[i] = singleImageData;
  }

  return imageDatasArr;
})(imageDatas);

class ImgFigure extends React.Component {

  constructor (props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  /**
   * ImgFigure的点击处理函数
   */
  handleClick (e) {
    if (this.props.arrange.isCenter) {
      this.props.inverse();
    } else {
      this.props.center();
    }

    e.stopPropagation();
    e.preventDefault();
  }

  render() {

    let styleObj = {};

    // 如果 props 属性中指定了这张图片的位置，则使用
    if (this.props.arrange.pos) {
      styleObj = this.props.arrange.pos;
    }

    // 如果图片的旋转角度有值并不为0，添加旋转角度
    if (this.props.arrange.rotate) {
      styleObj['transform'] = 'rotate(' + this.props.arrange.rotate + 'deg)';
    }

    if (this.props.arrange.isCenter) {
      styleObj.zIndex = 11;
    }

    let imgFigureClassName = 'img-figure';
        imgFigureClassName += this.props.arrange.isInverse ? ' is-inverse' : '';

    return (
      <figure className={imgFigureClassName} style={styleObj} onClick={this.handleClick}>
        <img src={this.props.data.imageURL} alt={this.props.data.title}/>
        <figcaption>
          <h2 className="img-title">{this.props.data.title}</h2>
          <div className="img-back" onClick={this.handleClick}>
            <p>
              {this.props.data.desc}
            </p>
          </div>
        </figcaption>
      </figure>
    );
  }
}
/**
 * 控制组件
 */
class ControllerUnit extends React.Component {

  constructor (props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick (e) {
    // 如果点击的是当前正在选中态的按钮，则翻转图片，否则将对应的图片居中
    if (this.props.arrange.isCenter) {
      this.props.inverse();
    } else {
      this.props.center();
    }

    e.preventDefault();
    e.stopPropagation();
  }

  render () {
    let controlerUnitClassName = "controller-unit";

    // 如果对应的是居中的图片，显示控制按钮的居中态
    if (this.props.arrange.isCenter) {
      controlerUnitClassName += " is-center";

      // 如果同时应对的是翻转图片，显示控制按钮的翻转态
      if (this.props.arrange.isInverse) {
        controlerUnitClassName += ' is-inverse';
      }
    }

    return (
      <span className={controlerUnitClassName} onClick={this.handleClick}></span>
    );
  }
}



class AppComponent extends React.Component {
  Constant = {
    centerPos: {
      left: 0,
      right: 0
    }
  }
  hPosRange = {
    leftSecX: [0, 0],
    rightSecX: [0, 0],
    y: [0, 0]
  }
  vPosRange = {
    x: [0, 0],
    topY: [0, 0]
  }

  /**
   * 翻转图片
   * @param index 输入当前被执行inverse操作的图片对应的图片信息数组的index值
   * @return {Function} 这是一个闭包函数，其内return一个真正待执行的函数
   */
   inverse (index) {
     return function () {
       let imgsArrangeArr = this.state.imgsArrangeArr;

       imgsArrangeArr[index].isInverse = !imgsArrangeArr[index].isInverse;

       this.setState({
         imgsArrangeArr: imgsArrangeArr
       });

     }.bind(this);
   }

  /**
   * 获取区间内的一个随机值
   */
  getRangeRandom (low, high) {
    return Math.ceil(Math.random() * (high - low) + low);
  }

  /**
   * 获取 0-30 之间的一个任意正负值
   */
   get30DegRandom() {
     return ((Math.random() > 0.5 ? '' : '-') + Math.ceil(Math.random() * 30));
   }

  /**
   * 重新布局所有图片
   * @param centerIndex 指定居中排布哪张图片
   */
  rearrange(centerIndex) {
    let imgsArrangeArr = this.state.imgsArrangeArr,
        Constant = this.Constant,
        centerPos = Constant.centerPos,
        hPosRange = this.hPosRange,
        vPosRange = this.vPosRange,
        hPosRangeLeftSecX = hPosRange.leftSecX,
        hPosRangeRightSecX = hPosRange.rightSecX,
        hPosRangeY = hPosRange.y,
        vPosRangeTopY = vPosRange.topY,
        vPosRangeX = vPosRange.x,
        imgsArrangeTopArr = [],
        // 取一个或不取
        topImgNum = Math.floor(Math.random() * 2),
        topImgSpliceIndex = 0,
        imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex, 1);

        // 首先居中 centerIndex 的图片
        imgsArrangeCenterArr[0] = {
          pos: centerPos,
          rotate: 0,
          isCenter: true
        }

        // 取出要布局上侧的图片的状态信息
        topImgSpliceIndex = Math.ceil(Math.random() * (imgsArrangeArr.length - topImgNum));

        imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex, topImgNum);

        // 布局位于上侧的图片
        imgsArrangeTopArr.forEach(function (value, index){
          imgsArrangeTopArr[index] = {
            pos: {
              top: this.getRangeRandom(vPosRangeTopY[0], vPosRangeTopY[1]),
              left: this.getRangeRandom(vPosRangeX[0], vPosRangeX[1])
            },
            rotate: this.get30DegRandom(),
            isCenter: false
          }
        }.bind(this))

        // 布局左右两侧的图片
        for (let i = 0, j = imgsArrangeArr.length, k = j / 2; i < j; i++) {
          let hPosRangeLORX = null;

          // 前半部分布局左侧，有半部分布局右侧
          if (i < k) {
            hPosRangeLORX = hPosRangeLeftSecX;
          } else {
            hPosRangeLORX = hPosRangeRightSecX;
          }

          imgsArrangeArr[i] = {
            pos: {
              top: this.getRangeRandom(hPosRangeY[0], hPosRangeY[1]),
              left: this.getRangeRandom(hPosRangeLORX[0], hPosRangeLORX[1])
            },
            rotate: this.get30DegRandom(),
            isCenter: false
          }

        }

        if (imgsArrangeTopArr && imgsArrangeTopArr[0]) {
          imgsArrangeArr.splice(topImgSpliceIndex, 0, imgsArrangeTopArr[0]);
        }

        imgsArrangeArr.splice(centerIndex, 0, imgsArrangeCenterArr[0]);

        this.setState({
          imgsArrangeArr: imgsArrangeArr
        });
  }

  /**
   * 利用 rearrange 函数，居中对应 index 的图片
   * @param index, 需要被居中的图片的对应的图片信息数组的 index 值
   * @return {Function}
   */
  center (index) {
    return function () {
      this.rearrange(index);
    }.bind(this);
  }

  constructor (props) {
    super(props);
    this.state = {
      imgsArrangeArr: []
    }
  }

  /**
   * 组件加载后，为每张图片计算其位置的范围
   */
  componentDidMount() {

    //舞台的大小
    let stageDOM = this.stage,
        stageW = stageDOM.scrollWidth,
        stageH = stageDOM.scrollHeight,
        halfStageW = Math.ceil(stageW / 2),
        halfStageH = Math.ceil(stageH / 2);

    //获取一个imageFigure的大小
    // let imgFigureDOM = this.imgFigure0,
    let imgFigureDOM = ReactDOM.findDOMNode(this.imgFigure0),
        imgW = imgFigureDOM.scrollWidth,
        imgH = imgFigureDOM.scrollHeight,
        halfImgW = Math.ceil(imgW / 2),
        halfImgH = Math.ceil(imgH / 2);

    // 计算中心图片的位置点
    this.Constant.centerPos = {
      left: halfStageW - halfImgW,
      top: halfStageH - halfImgH
    }
    // 计算左侧，右侧区域图片排布位置的范围
    this.hPosRange.leftSecX[0] = -halfImgW;
    this.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;
    this.hPosRange.rightSecX[0] = halfStageW + halfImgW;
    this.hPosRange.rightSecX[1] = stageW - halfImgW;
    this.hPosRange.y[0] = -halfImgH;
    this.hPosRange.y[1] = stageH - halfImgH;
    // 计算上册区域图片排布位置的范围
    this.vPosRange.topY[0] = -halfImgH;
    this.vPosRange.topY[1] = halfStageH - halfImgH * 3;
    this.vPosRange.x[0] = halfStageW - imgW;
    this.vPosRange.x[1] = halfStageW;

    this.rearrange(0);
  }

  render() {
    let controllerUnits = [],
        imgFigures = [];

    for (let [index, value] of imageDatas.entries()) {
      if (!this.state.imgsArrangeArr[index]) {
        this.state.imgsArrangeArr[index] = {
          pos: {
            left: 0,
            top: 0
          },
          rotate: 0,
          isInverse: false,
          isCenter: false
        }
      }

      imgFigures.push(<ImgFigure key={'imgFigure' + index} data={value} ref={(ImgFigure) => {this['imgFigure' + index] = ImgFigure}}
      arrange={this.state.imgsArrangeArr[index]} inverse={this.inverse(index)} center={this.center(index)}/>);

      controllerUnits.push(<ControllerUnit key={'controller' + index} arrange={this.state.imgsArrangeArr[index]}
      inverse={this.inverse(index)} center={this.center(index)}/>);
    }


    return (
      <section className="stage" ref={(section) => {this.stage = section}}>
        <section className="img-sec">
          {imgFigures}
        </section>
        <nav className="controller-nav">
          {controllerUnits}
        </nav>
      </section>
    );
  }
}

AppComponent.propTypes = {
  imgFigures: React.PropTypes.element.isRequired
}

AppComponent.defaultProps = {
  imgFigures: <h1>Imgage Nothing</h1>
};

export default AppComponent;

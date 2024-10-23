import React, { useEffect, useRef, useState, Fragment, useLayoutEffect, useCallback } from 'react'
import { fabric } from 'fabric';
import { SketchPicker } from 'react-color';
import io from 'socket.io-client';
import './style.css';
import './whiteboard.css';
import { BsSquare, BsCircle, BsPencil } from 'react-icons/bs';
import { AiOutlineSelect} from 'react-icons/ai';
import { HiOutlineMinus } from 'react-icons/hi';
import { RiGalleryFill } from 'react-icons/ri';
import { CgColorPicker } from 'react-icons/cg';
import { useParams, useSearchParams } from 'next/navigation';



const getSvgPathFromStroke = stroke => {
  if (!stroke.length) return "";
  let path = '';
  stroke.forEach(point => {
    point = point.join(' ');
    path += ' ' + point; 
  });

  return path;
};


let canvas;
let newLine;
let newRectangle;
let newCircle;
let drawing = false;
let tool = 'line';
let origX;
let origY;
let circleX1;
let color = 'black';
let strokeSize = 3;
let socket;
let myPoint = { x: 0, y: 0 };
let myWidth = window.innerWidth;
let myHeight = window.innerHeight;
let myZoom = 1;
let zoomPoint = { x: 0, y: 0 }
let userId = null;
const WhiteBoard = ({ role, users }) => {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params.id;


  const [navActive, setNavActive] = useState(false);
  const [boxColor, setBoxColor] = useState('black');
  const [strokeBoxSize, setStrokeBoxSize] = useState(3);
  const [colorBoxOpen, setColorBoxOpen] = useState(false);
  const [strokeActive, setStrokeActive] = useState(false);
  const sizeList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const canvasRef = useRef(null);
  const boxRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const [myId, setMyId] = useState('');
  const [data, setData] = useState([]);

  const [room, setRoom] = useState(null);
  const serverUrl = process.env.NEXT_PUBLIC_WHITEBOARD_SERVER_URL;




  const onDraw = useCallback(() => {
    const elements = canvas.getObjects();
    socket.emit('send-element', { roomId, elements });
   
  }, []);

 

  const hanlderNewUserJoin = useCallback(({ name }) => {
    const elements = canvas.getObjects();
    socket.emit('send-element', { elements, roomId });
  }, []);

  const hanlderRiciveElement = useCallback(({ elements }) => {
    setData([...elements]);
  }, []);


  const handleLeave = useCallback(({ name }) => {
    console.log(`${name} left the room`);
  }, []);




  useEffect(() => {
    socket = io(serverUrl, { transports: ['websocket'] });
    socket.on('connect', () => {
      setMyId(socket.id);
      userId = socket.id;
      if (roomId) {
        
        socket.emit('join-room', { roomId, name: searchParams.get("fullName"), userId: socket.id });
      }
    });


    socket.on('new-user', hanlderNewUserJoin);
    socket.on('recive-element', hanlderRiciveElement);
    socket.on('leave', handleLeave);

    return () => {
      socket.off('new-user', hanlderNewUserJoin);
      socket.off('recive-element', hanlderRiciveElement);
      socket.off('leave', handleLeave);
    }

  }, []);

  useLayoutEffect(() => {
    const canvasWidth = document.getElementById('sketch').clientWidth-1;
    const canvasHeight = document.getElementById('sketch').clientHeight-1;
    
    const options = {
      width: canvasWidth,
      height: canvasHeight,
      selection: false,
      selectable: false
    }
    const context = canvasRef.current.getContext("2d");
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    canvas = new fabric.Canvas(canvasRef.current, options);

    if (data.length !== 0) {
      data.forEach(({ type, width, height, top, left, stroke, strokeWidth, fill, radius, angle, x1, x2, y1, y2, path, src, scaleX, scaleY, skewX, skewY }) => {
        switch (type) {
          case 'rect':
            newRectangle = new fabric.Rect({
              width,
              height,
              top,
              left,
              stroke,
              strokeWidth,
              fill,
              angle,
              scaleX, scaleY, skewX, skewY
            });
            canvas.add(newRectangle);
            canvas.requestRenderAll();
            break;
          case "circle":
            newCircle = new fabric.Circle({
              left,
              top,
              radius,
              stroke,
              strokeWidth,
              fill,
              angle,
              scaleX, scaleY, skewX, skewY
            });
            canvas.add(newCircle);
            canvas.requestRenderAll();
            break;
          case 'line':
            newLine = new fabric.Line([left, top, width + left, height + top], {
              stroke,
              strokeWidth,
              angle,
              scaleX, scaleY, skewX, skewY
            });
            canvas.add(newLine);
            canvas.requestRenderAll();
            break;
          case 'path':
            const stroke22 = getSvgPathFromStroke(path);
            const pencil = new fabric.Path(stroke22, {
              stroke,
              strokeWidth,
              angle,
              fill: 'transparent',
              scaleX, scaleY, skewX, skewY
            });
            canvas.add(pencil);
            canvas.requestRenderAll();
            break;
          case "image":
           
            fabric.Image.fromURL(src, function (img) {
              img.set({ left, top, width, height, angle, scaleX, scaleY, skewX, skewY })
              canvas.add(img);
              canvas.requestRenderAll();
            });
            break;
        }
      });
    }


    return () => {
      canvas.dispose()
    }

  }, [data]);

  const handelPencil = useCallback(() => {
    canvas.off('mouse:down', handleMouseDown);
    canvas.off('mouse:move', handleMouseMove);
    canvas.off('mouse:up', handleMouseUp);
    canvas.isDrawingMode = true;
    canvas.selectable = false;
    canvas.evented = false;
    setStrokeActive(!strokeActive);
    tool = 'pencil';
    canvas.forEachObject(function (object) {
      object.selectable = false;
      object.hoverCursor = 'auto';
    });
  }, []);

  const handlerSelect = useCallback(() => {
    canvas.selection = true;
    canvas.selectable = true;
    canvas.evented = true;
    canvas.off('mouse:down', handleMouseDown);
    canvas.off('mouse:move', handleMouseMove);
    canvas.off('mouse:up', handleMouseUp);
    canvas.isDrawingMode = false;
    tool = 'selection';
    canvas.forEachObject(function (object) { object.selectable = true });
  }, []);

  const toolHandler = useCallback((toolName) => {
    tool = toolName;
    canvas.isDrawingMode = false;
    canvas.selectable = false;
    canvas.selection = false;
    canvas.evented = false;
    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);
    canvas.forEachObject(function (object) {
      object.selectable = false;
      object.hoverCursor = 'auto';
    });
  }, []);

  function handleMouseDown(o) {
    const pointer = canvas.getPointer(o.e);
    drawing = true;
    if (tool == 'line') {
      newLine = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
        stroke: color,
        strokeWidth: 3
      });
      canvas.add(newLine);
      canvas.requestRenderAll();
      canvas.selectable = false;
    } else if (tool == 'rectangle') {
      origX = pointer.x;
      origY = pointer.y;
      newRectangle = new fabric.Rect({
        width: 0,
        height: 0,
        top: pointer.y,
        left: pointer.x,
        stroke: color,
        strokeWidth: 3,
        fill: 'transparent'
      });
      canvas.add(newRectangle);
      canvas.requestRenderAll();
      canvas.selectable = false;
    } else if (tool == 'circle') {
      circleX1 = pointer.x;
      newCircle = new fabric.Circle({
        left: pointer.x,
        top: pointer.y,
        radius: 0,
        stroke: color,
        strokeWidth: 3,
        fill: 'transparent'
      });
      canvas.add(newCircle);
      canvas.requestRenderAll();
      canvas.selection = false;
      canvas.selectable = false;
    }
  };

  function handleMouseMove(o) {
    const pointer = canvas.getPointer(o.e);
    if (!drawing) {
      return false
    }

    if (tool == 'line') {
      newLine.set({
        x2: pointer.x,
        y2: pointer.y
      });
    } else if (tool == 'rectangle') {
      let x = Math.min(pointer.x, origX);
      let y = Math.min(pointer.y, origY);
      let w = Math.abs(origX - pointer.x);
      let h = Math.abs(origY - pointer.y);
      newRectangle.set('top', y).set('left', x).set('height', h).set('width', w)
    } else if (tool == 'circle') {
      newCircle.set('radius', Math.abs(pointer.x - circleX1));
    }
    canvas.requestRenderAll();
    canvas.selectable = false;
  };

  const handleMouseUp = event => {
    drawing = false;
    const pointer = canvas.getPointer(event.e);
  };

  const handleColor = useCallback((c) => {
    setBoxColor(c.hex);
    color = c.hex;
    canvas.freeDrawingBrush.color = c.hex;
  }, []);

  const handleStroke = useCallback((e) => {
    strokeSize = e.target.value;
    setStrokeBoxSize(e.target.value);

    canvas.freeDrawingBrush.width = parseInt(e.target.value, 10) || 1;
  }, []);

  // bg image handler 
  const readFileSync = useCallback((file) => {
    return new Promise((res, rej) => {
      let reader = new FileReader();
      reader.onload = e => {
        const data = atob(e.target.result.replace(/.*base64,/, ''));
        res(data);
      }
      reader.onerror = err => {
        rej(err);
      }
      reader.readAsDataURL(file);
    })
  }, []);

  const imageToBase64 = useCallback((file) => {
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          res(reader.result);
        }
      }
      reader.readAsDataURL(file);
    })
  }, []);

  async function onUpload(e) {
    const file = e.target.files[0];
    let fileExtension = file.name.split('.');
    fileExtension = fileExtension[fileExtension.length - 1];
    if (fileExtension !== 'pdf') {
      const imageLoad = await imageToBase64(file);
      if (imageLoad) {
        fabric.Image.fromURL(imageLoad, function (img) {
          img.set('left', window.innerWidth / 3).set('top', window.innerHeight / 3)
          canvas.add(img);
          canvas.requestRenderAll();
          canvas.selectable = false;
        });
      }
      return
    }

    const data = await readFileSync(file);
    renderPDF(data);
  }


  async function renderPDF(data) {
    try {
      const pdf = await window.pdfjs.getDocument({ data }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 2 });
      const Dcanvas = document.createElement('canvas');
      const canvasContext = Dcanvas.getContext('2d');
      Dcanvas.height = viewport.height;
      Dcanvas.width = viewport.width;
      await page.render({ canvasContext, viewport }).promise;
      const firstImage = Dcanvas.toDataURL('image/png');
      if (firstImage) {
        fabric.Image.fromURL(firstImage, function (img) {
          img.set('left', window.innerWidth / 3).set('top', window.innerHeight / 3)
          canvas.add(img);
          canvas.requestRenderAll();
          canvas.selectable = false;
        });
      }
    } catch (err) {
      console.log(err.message)
    }
  }

  const onScroll = useCallback(() => {
    const { scrollTop, scrollLeft } = boxRef.current;
    myPoint = { y: scrollTop, x: scrollLeft };
  }, []);


  return (
    <div className="bg-white board-container flex justify-start items-center  w-full h-full rounded-xl relative">
      <div id="sketch" className="sketch absolute border-2 border-black overflow-auto" ref={canvasContainerRef}>

        <div className='box' onMouseMove={() => onDraw()} ref={boxRef} onScroll={onScroll}>


          <nav className='top_nav'>
            <button
              id="rectangle"
              onClick={() => toolHandler("rectangle")}
            ><BsSquare /></button>

            <button
              id="circle"
              onClick={() => toolHandler("circle")}
            ><BsCircle /></button>
            <button
              id="selection"
              onClick={handlerSelect}
            ><AiOutlineSelect /></button>
            <button
              id="line" onClick={() => toolHandler('line')}
            ><HiOutlineMinus /></button>
            <button
              id="pencil"
              onClick={handelPencil}
            ><BsPencil />
            </button>
            {
              strokeActive &&
              <div className='stroke_box flex_d_col'>
                <label >
                  Stroke Width
                </label>
                <input type='text' placeholder='stroke width' list='size' value={strokeBoxSize} onChange={handleStroke} />
                <datalist id='size'>
                  {
                    sizeList.map((size, i) => <Fragment key={i}><option value={size} /></Fragment>)
                  }
                </datalist>
              </div>
            }
            <button onClick={() => setColorBoxOpen(!colorBoxOpen)}><CgColorPicker /></button>
            {
              colorBoxOpen &&
              <div className='color_picker stroke_box'>
                <SketchPicker color={boxColor} onChangeComplete={handleColor} defaultValue='#452135' />
              </div>
            }
            <input type='file' style={{ display: 'none' }} id='chooseFile' onChange={onUpload} />
            <button><label htmlFor='chooseFile' ><RiGalleryFill /></label></button>
          </nav>
          <canvas
            id="canvas"
            ref={canvasRef}
            style={{overflow: 'auto'}}
          >
          </canvas>
        </div>

      </div>
    </div>
  );
};

export default WhiteBoard;

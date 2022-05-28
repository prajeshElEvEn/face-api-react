import './App.css';
import * as faceapi from '@vladmandic/face-api'
import { useEffect, useRef, useState } from 'react';

function App() {
  const videoRef = useRef();
  const canvasRef = useRef();

  const videoHeight = 680;
  const videoWidth = 840;

  const handleVideo = () => {
    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(
          videoRef.current,
          new faceapi.SsdMobilenetv1Options()
        )
        .withFaceLandmarks()
        .withFaceExpressions()

      canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(videoRef.current)
      faceapi.matchDimensions(canvasRef.current, {
        width: videoRef.current.width,
        height: videoRef.current.height
      })
      const resizedDetections = faceapi.resizeResults(detections, {
        width: videoRef.current.width,
        height: videoRef.current.height
      })
      faceapi.draw.drawDetections(canvasRef.current, resizedDetections)
      faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections)
      resizedDetections.forEach(detection => {
        const box = detection.detection.box
        const drawBox = new faceapi.draw.DrawBox(box, { label: 'Face' })
        drawBox.draw(canvasRef.current)
      })

      // new faceapi.draw.DrawBox(canvasRef.current, { label: 'Face' })
      // faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections)
    }, 100)
  }

  useEffect(() => {
    const loadModels = async () => {
      Promise.all([
        await faceapi.nets.ssdMobilenetv1.load('/models'),
        await faceapi.nets.ageGenderNet.load('/models'),
        await faceapi.nets.faceLandmark68Net.load('/models'),
        await faceapi.nets.faceRecognitionNet.load('/models'),
        await faceapi.nets.faceExpressionNet.load('/models')
      ])
        .then()
        .catch((err) => {
          console.log(err);
        })
    }
    loadModels()
  }, [])

  const triggerVideo = () => {
    if (videoRef.current.paused) {
      playVideo()
    } else {
      videoRef.current.pause()
    }
  }

  const quitVideo = () => {
    window.location.reload()
  }

  const playVideo = async () => {
    const video = videoRef.current
    await navigator.mediaDevices.getUserMedia(
      {
        video: {
          facingMode: 'user'
        }
      }
    )
      .then(stream => {
        video.srcObject = stream
        video.play()
        handleVideo()
      })
  }

  return (
    <div className="container">
      <div className='App'>
        <video ref={videoRef} height={videoHeight} width={videoWidth} />
        <canvas ref={canvasRef} height={videoHeight} width={videoWidth} />
      </div>
      <div className='btns'>
        <button onClick={() => {
          triggerVideo()
        }}>Start</button>
        <button onClick={() => {
          quitVideo()
        }}>Quit</button>
      </div>
    </div>
  );
}

export default App;

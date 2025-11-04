import {useEffect, useMemo, useRef, useState} from 'react'
import {Button, Divider, Input, InputNumber, Select, Space, Typography} from 'antd'
import { QRCodeCanvas } from 'qrcode.react'
import JsBarcode from 'jsbarcode'

// 中文注释：二维码/条形码生成器
// 目标：输入任意文本，实时生成二维码与条形码，并提供下载功能
// 说明：二维码使用 qrcode.react 渲染为 Canvas；条形码使用 JsBarcode 渲染到 Canvas

const { Title, Text } = Typography

const QRErrorLevels = [
  { label: 'L（7% 容错）', value: 'L' },
  { label: 'M（15% 容错）', value: 'M' },
  { label: 'Q（25% 容错）', value: 'Q' },
  { label: 'H（30% 容错）', value: 'H' },
]

export default function CodeGenerator() {
  // 通用输入：待编码的文本内容
  const [text, setText] = useState('http://wxcb.kangdd.com?id=1915681410330882048&storeId=1914583328487211008&type=2')

  // 二维码参数（使用 Canvas 渲染，便于导出图片）
  const [qrSize, setQrSize] = useState(200)
  const [qrLevel, setQrLevel] = useState('M')
  const [qrFgColor, setQrFgColor] = useState('#000000')
  const [qrBgColor, setQrBgColor] = useState('#ffffff')
  const [qrMargin, setQrMargin] = useState(2)

  // 条形码参数（默认 CODE128，通用性较好）
  const [barLineColor, setBarLineColor] = useState('#000000')
  const [barBgColor, setBarBgColor] = useState('#ffffff')
  const [barWidth, setBarWidth] = useState(2) // 条形线条宽度
  const [barHeight, setBarHeight] = useState(80) // 条形码高度
  const [barShowText, setBarShowText] = useState(true) // 是否显示可读文本
  const [barMargin, setBarMargin] = useState(10) // 边距

  // Canvas 引用：二维码与条形码
  const qrCanvasRef = useRef(null)
  const barCanvasRef = useRef(null)

  // 根据输入与参数，实时渲染条形码
  useEffect(() => {
    if (!barCanvasRef.current) return
    try {
      // 中文注释：使用 CODE128 可编码任意 ASCII，适配范围更广
      JsBarcode(barCanvasRef.current, text || ' ', {
        format: 'CODE128',
        displayValue: barShowText,
        lineColor: barLineColor,
        background: barBgColor,
        width: Number(barWidth) || 2,
        height: Number(barHeight) || 80,
        margin: Number(barMargin) || 10,
        // 中文注释：如需设置字体/字号，可额外传入 font, fontSize 等参数
      })
    } catch (e) {
      // 中文注释：若文本不被具体制式支持，JsBarcode 会抛错，这里简单吞并并在 UI 端通过提示引导
      // console.error(e)
    }
  }, [text, barShowText, barLineColor, barBgColor, barWidth, barHeight, barMargin])

  // 下载工具：将 Canvas 导出为 PNG
  const downloadCanvasAsPng = (canvas, filename) => {
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    // 创建临时链接下载
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
  }

  // 事件：下载二维码
  const handleDownloadQR = () => {
    // qrcode.react 在 renderAs='canvas' 时，内部会渲染一个 canvas
    // 这里通过父容器找到该 canvas。我们将 ref 绑定在包装 div 上，获取其中的 canvas
    if (!qrCanvasRef.current) return
    const canvas = qrCanvasRef.current.querySelector('canvas')
    downloadCanvasAsPng(canvas, 'qrcode.png')
  }

  // 事件：下载条形码
  const handleDownloadBar = () => {
    downloadCanvasAsPng(barCanvasRef.current, 'barcode.png')
  }

  return (
    <div className="section" style={{ background: 'transparent' }}>
      {/* 标题与说明 */}
      <Title level={3} style={{ marginTop: 0 }}>二维码 / 条形码 生成器</Title>
      <Text type="secondary">输入内容后，即可在下方实时生成二维码与条形码，并可下载为图片</Text>

      <Divider />

      {/* 输入区域：统一输入文本 */}
      <div className="section">
        <h2 className="section-title">输入</h2>
        <Space direction="vertical" style={{ width: '100%' }} size={12}>
          <Input.TextArea
            rows={3}
            placeholder="请输入要编码的内容（任意字符串均可用于二维码；条形码使用 CODE128 兼容性更好）"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </Space>
      </div>

      {/* 展示区域：左右两列分别放置二维码与条形码 */}
      <div className="box" style={{ alignItems: 'flex-start' }}>
        {/* 左：二维码 */}
        <div className="inner" style={{ minWidth: 320 }}>
          <h3 className="section-title">二维码（QR Code）</h3>
          <div style={{ marginBottom: 12 }}>
            <Space wrap>
              <div>
                <div style={{ marginBottom: 4 }}>尺寸(px)</div>
                <InputNumber min={64} max={1024} value={qrSize} onChange={(v) => setQrSize(v || 200)} />
              </div>
              <div>
                <div style={{ marginBottom: 4 }}>容错等级</div>
                <Select
                  style={{ width: 160 }}
                  options={QRErrorLevels}
                  value={qrLevel}
                  onChange={setQrLevel}
                />
              </div>
              <div>
                <div style={{ marginBottom: 4 }}>前景色</div>
                {/* 原生取色器，避免引入额外依赖 */}
                <input type="color" value={qrFgColor} onChange={(e) => setQrFgColor(e.target.value)} />
              </div>
              <div>
                <div style={{ marginBottom: 4 }}>背景色</div>
                <input type="color" value={qrBgColor} onChange={(e) => setQrBgColor(e.target.value)} />
              </div>
              <div>
                <div style={{ marginBottom: 4 }}>边距</div>
                <InputNumber min={0} max={32} value={qrMargin} onChange={(v) => setQrMargin(v || 0)} />
              </div>
            </Space>
          </div>

          {/* 包装容器用于获取内部 canvas 以导出 */}
          <div ref={qrCanvasRef} style={{
            display: 'inline-block',
            padding: 8,
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
          }}>
            <QRCodeCanvas
              value={text || ' '}
              size={qrSize}
              level={qrLevel}
              fgColor={qrFgColor}
              bgColor={qrBgColor}
              includeMargin={!!qrMargin}
            />
          </div>

          <div style={{ marginTop: 12 }}>
            <Space>
              <Button type="primary" onClick={handleDownloadQR}>下载二维码 PNG</Button>
            </Space>
          </div>
        </div>

        {/* 右：条形码 */}
        <div className="inner" style={{ minWidth: 320 }}>
          <h3 className="section-title">条形码（CODE128）</h3>
          <div style={{ marginBottom: 12 }}>
            <Space wrap>
              <div>
                <div style={{ marginBottom: 4 }}>线条颜色</div>
                <input type="color" value={barLineColor} onChange={(e) => setBarLineColor(e.target.value)} />
              </div>
              <div>
                <div style={{ marginBottom: 4 }}>背景色</div>
                <input type="color" value={barBgColor} onChange={(e) => setBarBgColor(e.target.value)} />
              </div>
              <div>
                <div style={{ marginBottom: 4 }}>线条宽度</div>
                <InputNumber min={1} max={10} value={barWidth} onChange={(v) => setBarWidth(v || 2)} />
              </div>
              <div>
                <div style={{ marginBottom: 4 }}>高度</div>
                <InputNumber min={40} max={240} value={barHeight} onChange={(v) => setBarHeight(v || 80)} />
              </div>
              <div>
                <div style={{ marginBottom: 4 }}>边距</div>
                <InputNumber min={0} max={32} value={barMargin} onChange={(v) => setBarMargin(v || 0)} />
              </div>
              <div>
                <div style={{ marginBottom: 4 }}>显示文本</div>
                <Select
                  style={{ width: 120 }}
                  options={[{label:'是', value:true},{label:'否', value:false}]}
                  value={barShowText}
                  onChange={setBarShowText}
                />
              </div>
            </Space>
          </div>

          {/* Canvas 承载条形码图像 */}
          <div style={{
            display: 'inline-block',
            padding: 8,
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
          }}>
            <canvas ref={barCanvasRef} />
          </div>

          <div style={{ marginTop: 12 }}>
            <Space>
              <Button type="primary" onClick={handleDownloadBar}>下载条形码 PNG</Button>
            </Space>
          </div>
        </div>
      </div>
    </div>
  )
}


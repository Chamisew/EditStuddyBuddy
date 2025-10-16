import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
// import BusDetailsCard from '@/components/busDetailsCard/BusDetailsCard';

const screenWidth = Dimensions.get('window').width;

const weekData = {
  labels: ['Week01', 'Week02', 'Week03', 'Week04'],
  datasets: [
    {
      data: [30, 75, 25, 60], 
    },
  ],
};

const monthData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], 
  datasets: [
    {
      data: [50, 60, 70, 40, 65, 70, 80, 45, 50, 65, 70, 60], 
    },
  ],
};

const chartConfig = {
  backgroundGradientFrom: '#FAFDFF',
  backgroundGradientTo: '#FAFDFF',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(72, 187, 120, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
  barPercentage: 0.8, // thicker bars for a larger visual
};

const EarningScreen = () => {
  const [displayTotal, setDisplayTotal] = useState(0);
  const targetTotal = 15000; // this could be dynamic later

  const handleWithdrawDownload = async () => {
    // Aim: on web capture the rendered earnings area and produce a PDF identical in colors;
    // on native try expo-print as a fallback.
    if (Platform.OS === 'web') {
      try {
        // Dynamic import of html2canvas and jspdf if available
        // @ts-ignore
        const html2canvas = (await import('html2canvas')).default;
        // @ts-ignore
        const { jsPDF } = await import('jspdf');

        // We only want to print the banner + left charts, not the Quick Summary / Recent Transactions
        const node = document.getElementById('earnings-printable') || document.getElementById('earnings-root');
        if (!node) {
          // fallback to print
          try { window.print(); } catch (e) { alert('Unable to print: element not found'); }
          return;
        }

        // Ensure element is visible and give the browser a moment to paint
        try { node.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) { /* ignore */ }
        await new Promise((res) => setTimeout(res, 350));

        // Capture at higher scale and allow CORS for external assets
        const canvas = await html2canvas(node, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: null });
        const imgData = canvas.toDataURL('image/png');

  // Use tabloid landscape for horizontal/tabloid PDF output
  // jsPDF supports orientation first: 'landscape', units 'pt', and size 'tabloid'
  const pdf = new jsPDF('landscape', 'pt', 'tabloid');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        // scale the image to fit width-wise in the PDF page
        const ratio = Math.min(pdfWidth / imgWidth, 1);
        const renderedW = imgWidth * ratio;
        const renderedH = imgHeight * ratio;

        // If the rendered image fits on a single page, add and save
        if (renderedH <= pdfHeight - 40) {
          pdf.addImage(imgData, 'PNG', (pdfWidth - renderedW) / 2, 20, renderedW, renderedH);
          pdf.save('earnings.pdf');
          return;
        }

        // Otherwise, slice the canvas into page-sized chunks and add each slice separately
        const pageInnerHeight = pdfHeight - 40; // top/bottom margins
        const scaleFactor = ratio; // canvas -> PDF scale factor

        // Calculate the height in canvas pixels that corresponds to one PDF page
        const canvasPageHeight = Math.floor(pageInnerHeight / scaleFactor);

        // Create an offscreen canvas to hold a single page slice
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = canvasPageHeight;
        const sliceCtx = sliceCanvas.getContext('2d');

        let srcY = 0;
        let pageAdded = 0;
        while (srcY < canvas.height) {
          // clear slice
          sliceCtx && sliceCtx.clearRect(0, 0, sliceCanvas.width, sliceCanvas.height);
          // draw portion of original canvas onto slice
          sliceCtx && sliceCtx.drawImage(canvas, 0, srcY, canvas.width, canvasPageHeight, 0, 0, sliceCanvas.width, sliceCanvas.height);

          const sliceData = sliceCanvas.toDataURL('image/png');
          const renderedSliceH = sliceCanvas.height * scaleFactor;

          pdf.addImage(sliceData, 'PNG', (pdfWidth - renderedW) / 2, 20, renderedW, renderedSliceH);
          pageAdded += 1;
          srcY += canvasPageHeight;
          if (srcY < canvas.height) pdf.addPage();
        }

        pdf.save('earnings.pdf');
        return;
      } catch (err) {
        console.warn('PDF generation failed (html2canvas/jspdf), falling back to print or showing instructions', err);
        // If the libraries are not installed, instruct the developer to install them
        const needsInstall = /Cannot find module|failed to fetch/i.test(String(err));
        if (needsInstall) {
          alert('To enable PDF download on web please install dependencies in the cleanPathCollectorApp folder:\n\nnpm install html2canvas jspdf\n\nAfter installing, restart the dev server and try again. Falling back to print...');
        }
        try { window.print(); } catch (e) { alert('Unable to print or generate PDF'); }
        return;
      }
    }

    // Native: try expo-print
    try {
      const html = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>body{font-family: Arial, Helvetica, sans-serif;background:#F7FFF7;color:#374151;padding:18px}</style>
          </head>
          <body>
            <h2 style="color:#2E7D32">Total Balance</h2>
            <h1 style="color:#2E7D32">Rs. ${targetTotal.toLocaleString()}.00</h1>
            <p style="color:#2E7D32">Available to withdraw • Updated today</p>
          </body>
        </html>
      `;
      // @ts-ignore
      const Print = await import('expo-print');
      // @ts-ignore
      const result = await Print.printToFileAsync({ html });
      Alert.alert('PDF generated', `Saved to: ${result.uri}`);
    } catch (err) {
      console.warn('Native print error', err);
      Alert.alert('Error', 'Unable to generate PDF on this device. Install expo-print to enable native PDF generation.');
    }
  };

  const handleWithdrawPrint = async () => {
    // Create a simple HTML snapshot that mirrors the key parts of this screen and colors
    const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, Helvetica, sans-serif; background: #F7FFF7; color: #374151; padding: 20px }
            .banner { background: #F7FFF7; padding: 18px; border-radius: 12px; border: 1px solid #EAF8ED }
            .label { color: #2E7D32; font-weight: 700; font-size: 12px }
            .total { color: #2E7D32; font-weight: 800; font-size: 34px }
            .subtitle { color: #2E7D32; font-weight: 700; margin-top: 8px }
            .section { margin-top: 18px }
            .heading { color: #2E7D32; font-weight: 700; font-size: 18px }
          </style>
        </head>
        <body>
          <div class="banner">
            <div class="label">Total Balance</div>
            <div class="total">Rs. ${displayTotal.toLocaleString()}.00</div>
            <div class="subtitle">Available to withdraw • Updated today</div>
          </div>
          <div class="section">
            <div class="heading">Weekly Earnings</div>
            <div>Data: ${weekData.datasets[0].data.join(', ')}</div>
          </div>
          <div class="section">
            <div class="heading">Monthly Earnings</div>
            <div>Data: ${monthData.datasets[0].data.join(', ')}</div>
          </div>
        </body>
      </html>
    `;

    try {
      if (typeof window !== 'undefined' && window?.document) {
        // Web: open new window and print
        const w = window.open('', '_blank');
        if (!w) {
          alert('Unable to open print window');
          return;
        }
        w.document.write(html);
        w.document.close();
        w.focus();
        w.print();
        w.close();
        return;
      }

      // Native: try to use expo-print dynamically
  // Dynamic import: expo-print may not be installed in this environment
  // @ts-ignore
  const Print = await import('expo-print');
  // @ts-ignore
  await Print.printAsync({ html });
    } catch (err) {
      // If expo-print isn't installed or any other error
      console.warn('Print error', err);
      try {
        // Fallback: attempt to open web browser print via expo-web-browser
        const WebBrowser = await import('expo-web-browser');
        await WebBrowser.openBrowserAsync('about:blank');
      } catch (e) {
        alert('Unable to generate PDF/print from this device.');
      }
    }
  };

  useEffect(() => {
    let start = 0;
    const duration = 800; // ms
    const stepTime = 20;
    const steps = Math.ceil(duration / stepTime);
    const increment = Math.ceil((targetTotal - start) / steps);
    const timer = setInterval(() => {
      start += increment;
      if (start >= targetTotal) {
        start = targetTotal;
        clearInterval(timer);
      }
      setDisplayTotal(start);
    }, stepTime);
    return () => clearInterval(timer);
  }, []);

  if (!weekData || !weekData.datasets || !weekData.datasets[0].data || weekData.datasets[0].data.length === 0) {
    return <Text>No data available</Text>; 
  }
  
  if (!monthData || !monthData.datasets || !monthData.datasets[0].data || monthData.datasets[0].data.length === 0) {
    return <Text>No data available</Text>; 
  }

  // Responsive helpers
  const isWide = screenWidth >= 900;
  const containerWidth = Math.min(screenWidth, 1100);
  const leftColWidth = isWide ? Math.floor(containerWidth * 0.66) : screenWidth - 48; // padding accounted
  const chartWidth = Math.max(300, Math.min(leftColWidth - 40, 900));

  return (
    <ScrollView className="px-4 py-4 h-full bg-swhite" style={{ backgroundColor: '#F7FFF7' }}>
      {/* top spacer before page start */}
      <View style={{ height: 18 }} />
      <View nativeID="earnings-root" style={{ maxWidth: 1100, alignSelf: 'center', width: '100%' }}>
        {/* Main content: responsive two-column */}
        <View style={{ flexDirection: isWide ? 'row' : 'column' }}>
          {/* Left - Charts (larger) */}
          <View style={{ flex: 2, marginRight: isWide ? 20 : 0, marginBottom: isWide ? 0 : 20 }}>
            {/* Printable area - includes banner + left charts only */}
            <View nativeID="earnings-printable" style={{ width: '100%' }}>
              {/* Banner */}
              <View className="w-full rounded-3xl overflow-hidden mb-8" style={{ borderRadius: 20 }}>
                <View style={{ backgroundColor: '#F7FFF7' }} className="p-5 rounded-2xl flex-row items-center justify-between">
                  {/* playful accents */}
                  <View style={{ position: 'absolute', left: 12, top: 12, width: 12, height: 12, borderRadius: 12, backgroundColor: 'rgba(86, 203, 129, 0.12)' }} />
                  <View style={{ position: 'absolute', right: 36, bottom: 12, width: 10, height: 10, borderRadius: 8, backgroundColor: '#E8FFF2' }} />
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View className="ml-0">
                      <Text style={{ fontWeight: '700', color: '#2E7D32', fontSize: 12 }}>Total Balance</Text>
                      <Text style={{ fontWeight: '800', color: '#2E7D32', fontSize: 34 }}>Rs. {displayTotal.toLocaleString()}.00</Text>
                      <Text style={{ fontWeight: '700', color: '#2E7D32', marginTop: 6 }}>Available to withdraw • Updated today</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={handleWithdrawDownload} style={{ backgroundColor: 'transparent', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 999, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#2E7D32', marginTop: 6, marginBottom: 32 }}>
                      <AntDesign name="download" size={14} color="#2E7D32" />
                      <Text style={{ color: '#2E7D32', marginLeft: 8, fontWeight: '600' }}>Withdraw</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View className="bg-white rounded-2xl p-4 mb-4" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 4, borderColor: '#EAF8ED', borderWidth: 1 }}>
                <View className="flex-row justify-between items-center mb-2">
                  <Text style={{ fontWeight: '700', color: '#2E7D32' }} className="text-lg">Weekly Earnings</Text>
                  <TouchableOpacity>
                    <Text style={{ color: '#059669', fontWeight: '600' }}>View all</Text>
                  </TouchableOpacity>
                </View>
                <BarChart
                  data={weekData}
                  width={chartWidth}
                  height={300}
                  yAxisLabel="Rs."
                  yAxisSuffix="k"
                  chartConfig={chartConfig}
                  verticalLabelRotation={0}
                  style={{ borderRadius: 8 }}
                />
              </View>

              <View className="bg-white rounded-2xl p-4" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 4, borderColor: '#EAF8ED', borderWidth: 1, marginTop: 12 }}>
                <View className="flex-row justify-between items-center mb-2">
                  <Text style={{ fontWeight: '700', color: '#2E7D32' }} className="text-lg">Monthly Earnings</Text>
                  <TouchableOpacity>
                    <Text style={{ color: '#059669', fontWeight: '600' }}>View all</Text>
                  </TouchableOpacity>
                </View>
                <BarChart
                  data={monthData}
                  width={chartWidth}
                  height={380}
                  yAxisLabel="Rs."
                  yAxisSuffix="k"
                  chartConfig={chartConfig}
                  verticalLabelRotation={0}
                  style={{ borderRadius: 8 }}
                />
              </View>
            </View> {/* end earnings-printable */}
          </View>

          {/* Right - Stats + Transactions (narrow) */}
          <View style={{ flex: 1, marginLeft: isWide ? 20 : 0 }}>
            <View className="bg-white rounded-2xl p-4 mb-5" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 3, borderColor: '#EFF8F0', borderWidth: 1 }}>
              <Text style={{ fontWeight: '700', color: '#2E7D32', marginBottom: 8 }}>Quick Summary</Text>
              <View className="flex-row justify-between items-center mb-3">
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 12, height: 12, borderRadius: 8, backgroundColor: '#86EFAC' }} />
                  <View className="ml-3">
                    <Text className="text-sm font-medium">This Week</Text>
                    <Text className="text-xs text-[#6B7280]">Rs. 3,200</Text>
                  </View>
                </View>
                <Text style={{ color: '#059669', fontWeight: '600' }}>▲ 12%</Text>
              </View>

              <View className="flex-row justify-between items-center mb-3">
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 12, height: 12, borderRadius: 8, backgroundColor: '#BBF7D0' }} />
                  <View className="ml-3">
                    <Text className="text-sm font-medium">This Month</Text>
                    <Text className="text-xs text-[#6B7280]">Rs. 15,000</Text>
                  </View>
                </View>
                <Text style={{ color: '#059669', fontWeight: '600' }}>▲ 8%</Text>
              </View>

              <View className="flex-row justify-between items-center">
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 12, height: 12, borderRadius: 8, backgroundColor: '#FDE68A' }} />
                  <View className="ml-3">
                    <Text className="text-sm font-medium">Pending</Text>
                    <Text className="text-xs text-[#6B7280]">Rs. 1,200</Text>
                  </View>
                </View>
                <Text style={{ color: '#F59E0B', fontWeight: '600' }}>Processing</Text>
              </View>
            </View>

            <View className="bg-white rounded-2xl p-2" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2, borderColor: '#F7FFF7', borderWidth: 1, marginTop: 6 }}>
              <Text style={{ fontWeight: '700', color: '#2E7D32', fontSize: 18, marginBottom: 12 }}>Recent Transactions</Text>
              {[{title: 'Pickup - Zone A', date: 'Oct 14', amount: 320}, {title: 'Pickup - Zone B', date: 'Oct 13', amount: 450}, {title: 'Route Bonus', date: 'Oct 12', amount: 200}].map((tx, idx) => (
                <View key={idx} className={`flex-row justify-between items-center py-4 ${idx < 2 ? 'border-b border-gray-100' : ''}`}>
                  <View className="flex-row items-center">
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F3FFF1', alignItems: 'center', justifyContent: 'center', borderWidth: 0 }}>
                      <AntDesign name="checkcircleo" size={18} color="#2E7D32" />
                    </View>
                    <View className="ml-3">
                      <Text className="text-sm font-medium">{tx.title}</Text>
                      <Text className="text-xs text-[#6B7280]">{tx.date}</Text>
                    </View>
                  </View>
                  <View style={{ backgroundColor: '#EEF2F7', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999 }}>
                    <Text className="text-sm font-semibold" style={{ color: '#374151' }}>Rs. {tx.amount}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
      <View style={{ height: 28 }} />
    </ScrollView>
  );
};

export default EarningScreen;

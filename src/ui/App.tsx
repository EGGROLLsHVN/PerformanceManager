import { useEffect, useMemo, useState } from 'react'
import reactLogo from '../assets/react.svg'
import './App.css'
import { useStatistics } from './useStatistics';
import { Chart } from './Chart';
import type { Props } from 'recharts/types/container/Surface';

function App() {
  const staticData = useStaticData();
  const statistics = useStatistics(25);

  const [activeView, setActiveView] = useState<View>("CPU");
  const cpuUsages = useMemo(() => statistics.map((stat) => stat.cpuUsage), [statistics]);
  const ramUsages = useMemo(() => statistics.map((stat) => stat.ramUsage), [statistics]);
  const storageUsages = useMemo(() => statistics.map((stat) => stat.storageUsage), [statistics]);

  const activeUsages = useMemo(() => {
    switch(activeView) {
      case "CPU":
        return cpuUsages;
      case "RAM":
        return ramUsages;
      case "STORAGE":
        return storageUsages;
    }
  }, [activeView, cpuUsages, ramUsages, storageUsages])

  useEffect(() => {
    window.electron.subscribeChangeView((view) => setActiveView(view))}, []);

  return (
    <div className = "App">
      <Header />
      <div className="main">
        <div>
          <SelectOption 
            title="CPU" 
            view="CPU"
            subTitle={staticData?.cpuModel ?? ""} 
            data={cpuUsages} 
            onClick={() => setActiveView("CPU")}
          />
          <SelectOption 
            title="RAM" 
            view="RAM" 
            subTitle={(staticData?.totalMemoryGB ?? "") + " GB"} 
            data={ramUsages}
            onClick={() => setActiveView("RAM")}
          />
          <SelectOption 
            title="STORAGE" 
            view="STORAGE" 
            subTitle={(staticData?.totalStorage ?? "") + " GB"} 
            data={storageUsages}
            onClick={() => setActiveView("STORAGE")}
          />
        </div>
        <div className = "mainGrid">
          <Chart selectedView={activeView} data={activeUsages} maxDataPoints={25} />
        </div>
      </div>
    </div>
  )
}

function useStaticData() {
  const [staticData, setStaticData] = useState<StaticData | null>(null);

  useEffect(() => {
    (async () => {
      setStaticData(await window.electron.getStaticData())
    }) ();
  }, [])

  return staticData;
}

function SelectOption(props: {
  title: string;
  view: View;
  subTitle: string | number;
  data: number[];
  onClick: () => void;
}) {
  return (
    <button className="selectOption" onClick={props.onClick}>
      <div className = "selectOptionTitle">
        <div>{props.title}</div>
        <div>{props.subTitle}</div>
      </div>
      <div className='selectOptionChart'>
        <Chart selectedView={props.view} data={props.data} maxDataPoints={25} />
      </div>
    </button>

  )
}

function Header() {
  return (
    <header>
        <button id = "minimize" 
                onClick={() => window.electron.sendFrameAction("MINIMIZE")}></button>
        <button id = "maximize" 
                onClick={() => window.electron.sendFrameAction("MAXIMIZE")}></button>
        <button id = "close" 
                onClick={() => window.electron.sendFrameAction("CLOSE")}/>
      </header>
  )
}

export default App

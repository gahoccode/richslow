# Lazy-Load Charts Using Intersection Observers

If you have multiple charts on a page, consider lazy-loading them as the user scrolls. This improves initial load times by rendering charts only when visible. You can use react-intersection-observer for easy implementation.

```tsx
import { useInView } from "react-intersection-observer";

const ChartComponent = ({ data }) => {
  const { refSetting triggerOnce: true loads the chart only when it first comes into view, conserving resources if the user doesn’t scroll down., inView } = useInView({ triggerOnce: true });

  return (
    <div ref={ref}>
      {inView && (
        <LineChart width={600} height={300} data={data}>
          <Line type="monotone" dataKey="value" stroke="#8884d8" />
        </LineChart>
      )}
    </div>
  );
};
```

Setting triggerOnce: true loads the chart only when it first comes into view, conserving resources if the user doesn’t scroll down.

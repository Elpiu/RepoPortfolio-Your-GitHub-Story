import {useActiveSectionContext} from "../../context/active-section";
import {useEffect, useState} from "react";
import {SectionName} from "@/lib/types";
import {useInView} from "react-intersection-observer";

type useSectionInViewProps = {
  sectionName: SectionName;
};

export function useSectionInView(sectionName: SectionName, threshold = 0.75) {
  // @ts-ignore
  const { ref, inView }: {} = useInView({
    threshold,
  });
  const {setActiveSection, timeOfLastClick} = useActiveSectionContext();

  useEffect(() => {
    if (inView && Date.now() - timeOfLastClick > 1000)
      setActiveSection(sectionName);
  }, [inView, setActiveSection, timeOfLastClick, sectionName]);

  return {ref, inView};
}

export function useJsonDataFromPublic<T>(storageFileName: string, accessorFieldName: string): T {
  const [jsonData, setJsonData] = useState<T | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/data/${storageFileName}.json`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setJsonData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      // Cleanup if needed
    };
  }, [accessorFieldName, storageFileName]);

  // Se jsonData è null, restituisci un valore di default per T
  // @ts-ignore
  return jsonData ? jsonData[accessorFieldName] : (null as unknown as T);
}

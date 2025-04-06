import Cardm from "@/components/medicinecard"

export default async function Page({
    params,
  }: {
    params: Promise<{ medicineid: string }>
  }) {
    return(
      <div>
         <h1>My Page {(await params).medicineid}</h1>
          <Cardm/>
      </div>
    );
  }
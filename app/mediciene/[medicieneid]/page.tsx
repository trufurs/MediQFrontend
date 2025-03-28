import Cardm from "@/components/medicinecard"

export default async function Page({
    params,
  }: {
    params: Promise<{ medicieneid: string }>
  }) {
    return(
      <div>
         <h1>My Page {(await params).medicieneid}</h1>
          <Cardm/>
      </div>
    );
  }
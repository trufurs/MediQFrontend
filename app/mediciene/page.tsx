"use client";
import Form from 'next/form'
import React from 'react'

function Medicienepage() {
  const [id , setid] = React.useState("")
  return (
    <div className='flex flex-col item-center justify-center'>
      <h1>Mediciene Page</h1>
      <div>
        <Form action={"mediciene/"+id} className='flex flex-row'>
        <input type="text" placeholder='eg. Paracetamol' value={id} onChange={(e) => setid(e.target.value)} className='p-2 border-2 border-black'>
        </input>
        <button type='submit' className='p-2 border-2 border-black'>🔍</button>
        </Form>
      </div>
    </div>
  )
}

export default Medicienepage
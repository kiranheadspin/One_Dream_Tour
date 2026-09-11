"use client";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
export function PrintButton(){return <Button onClick={()=>window.print()} variant="outline"><Printer data-icon="inline-start"/>Print or save PDF</Button>}

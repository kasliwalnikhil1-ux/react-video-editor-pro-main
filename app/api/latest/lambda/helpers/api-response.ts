import { NextResponse } from "next/server";
import { z, ZodType } from "zod";

export type ApiResponse<Res> =
  | {
      type: "error";
      message: string;
    }
  | {
      type: "success";
      data: Res;
    };

export const executeApi =
  <Res, Req extends ZodType>(
    schema: Req,
    handler: (req: Request, body: z.infer<Req>) => Promise<Res>
  ) =>
  async (req: Request) => {
    const requestId = Math.random().toString(36).substring(2, 15);
    const startTime = Date.now();
    
    console.log("=== API EXECUTION START ===");
    console.log("Request ID:", requestId);
    console.log("Timestamp:", new Date().toISOString());
    console.log("Request URL:", req.url);
    console.log("Request method:", req.method);
    
    try {
      // Extract and log request details
      console.log("=== REQUEST PROCESSING ===");
      console.log("Request headers:", JSON.stringify(req.headers.entries ? Object.fromEntries(req.headers.entries()) : {}, null, 2));
      
      console.log("Parsing request body...");
      const payload = await req.json();
      console.log("Raw payload:", JSON.stringify(payload, null, 2));
      console.log("Payload type:", typeof payload);
      console.log("Payload keys:", payload && typeof payload === 'object' ? Object.keys(payload) : []);
      
      console.log("=== SCHEMA VALIDATION ===");
      console.log("Schema name:", schema.constructor.name);
      console.log("Validating payload against schema...");
      
      const parseStartTime = Date.now();
      const parsed = schema.parse(payload);
      const parseEndTime = Date.now();
      
      console.log("Schema validation successful!");
      console.log("Parse time:", `${parseEndTime - parseStartTime}ms`);
      console.log("Parsed data:", JSON.stringify(parsed, null, 2));
      console.log("Parsed data type:", typeof parsed);
      console.log("Parsed data keys:", parsed && typeof parsed === 'object' ? Object.keys(parsed) : []);
      
      console.log("=== HANDLER EXECUTION ===");
      console.log("Calling handler function...");
      
      const handlerStartTime = Date.now();
      const data = await handler(req, parsed);
      const handlerEndTime = Date.now();
      
      console.log("Handler execution successful!");
      console.log("Handler execution time:", `${handlerEndTime - handlerStartTime}ms`);
      console.log("Handler response type:", typeof data);
      console.log("Handler response keys:", data && typeof data === 'object' ? Object.keys(data) : []);
      
      // Log response data (but be careful with large responses)
      if (data && typeof data === 'object') {
        const responseStr = JSON.stringify(data);
        if (responseStr.length > 1000) {
          console.log("Handler response (truncated):", responseStr.substring(0, 1000) + "...");
          console.log("Response size:", responseStr.length, "characters");
        } else {
          console.log("Handler response:", responseStr);
        }
      } else {
        console.log("Handler response:", data);
      }
      
      const totalTime = Date.now() - startTime;
      console.log("=== API EXECUTION SUCCESS ===");
      console.log("Total execution time:", `${totalTime}ms`);
      console.log("Request ID:", requestId);
      console.log("Success response being returned");
      
      const successResponse = {
        type: "success",
        data: data,
      };
      
      console.log("Final response structure:", JSON.stringify(successResponse, null, 2));
      
      return NextResponse.json(successResponse);
    } catch (err) {
      const totalTime = Date.now() - startTime;
      
      console.error("=== API EXECUTION ERROR ===");
      console.error("Request ID:", requestId);
      console.error("Error timestamp:", new Date().toISOString());
      console.error("Total execution time:", `${totalTime}ms`);
      console.error("Error type:", err?.constructor?.name);
      
      if (err instanceof Error) {
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
        
        if ('cause' in err) {
          console.error("Error cause:", err.cause);
        }
      }
      
      // Log Zod validation errors specifically
      if (err && typeof err === 'object' && 'issues' in err) {
        console.error("Zod validation error detected");
        console.error("Validation issues:", JSON.stringify(err.issues, null, 2));
      }
      
      // Log AWS-specific error details
      if (err && typeof err === 'object') {
        console.error("Error object keys:", Object.keys(err));
        
        if ('code' in err) {
          console.error("AWS Error Code:", err.code);
        }
        
        if ('statusCode' in err) {
          console.error("AWS Status Code:", err.statusCode);
        }
        
        if ('requestId' in err) {
          console.error("AWS Request ID:", err.requestId);
        }
        
        if ('region' in err) {
          console.error("AWS Region:", err.region);
        }
        
        if ('time' in err) {
          console.error("Error timestamp:", err.time);
        }
        
        if ('retryable' in err) {
          console.error("Error retryable:", err.retryable);
        }
      }
      
      const errorMessage = (err as Error).message;
      console.error("Error message to client:", errorMessage);
      
      const errorResponse = {
        type: "error",
        message: errorMessage,
      };
      
      console.error("Error response structure:", JSON.stringify(errorResponse, null, 2));
      console.error("=== END API EXECUTION ERROR ===");
      
      return NextResponse.json(errorResponse, {
        status: 500,
      });
    }
  };

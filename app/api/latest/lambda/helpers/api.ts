import { z } from "zod";
import type { RenderMediaOnLambdaOutput } from "@remotion/lambda/client";
import { CompositionProps, ProgressRequest, ProgressResponse, RenderRequest } from "../../../../reactvideoeditor/pro/types";

type ApiResponse<T> = {
  type: "success" | "error";
  data?: T;
  message?: string;
};

const makeRequest = async <Res>(
  endpoint: string,
  body: unknown
): Promise<Res> => {
  const requestId = Math.random().toString(36).substring(2, 15);
  const startTime = Date.now();
  
  console.log("=== CLIENT API REQUEST START ===");
  console.log("Request ID:", requestId);
  console.log("Timestamp:", new Date().toISOString());
  console.log("Endpoint:", endpoint);
  console.log("Request method:", "POST");
  
  try {
    console.log("=== REQUEST PREPARATION ===");
    console.log("Request body:", JSON.stringify(body, null, 2));
    console.log("Request body type:", typeof body);
    console.log("Request body keys:", body && typeof body === 'object' ? Object.keys(body) : []);
    
    const requestOptions = {
      method: "post",
      body: JSON.stringify(body),
      headers: {
        "content-type": "application/json",
      },
    };
    
    console.log("Request options:", JSON.stringify(requestOptions, null, 2));
    console.log("Making HTTP request...");
    
    const fetchStartTime = Date.now();
    const result = await fetch(endpoint, requestOptions);
    const fetchEndTime = Date.now();
    
    console.log("=== HTTP RESPONSE RECEIVED ===");
    console.log("Fetch time:", `${fetchEndTime - fetchStartTime}ms`);
    console.log("Response status:", result.status);
    console.log("Response status text:", result.statusText);
    console.log("Response headers:", JSON.stringify(Object.fromEntries(result.headers.entries()), null, 2));
    console.log("Response OK:", result.ok);
    
    if (!result.ok) {
      console.error("HTTP request failed!");
      console.error("Status:", result.status);
      console.error("Status text:", result.statusText);
      
      // Try to get error details from response
      try {
        const errorText = await result.text();
        console.error("Error response body:", errorText);
      } catch (textError) {
        console.error("Could not read error response body:", textError);
      }
      
      throw new Error(`HTTP request failed with status ${result.status}: ${result.statusText}`);
    }
    
    console.log("=== RESPONSE PARSING ===");
    console.log("Parsing JSON response...");
    
    const parseStartTime = Date.now();
    const json = (await result.json()) as ApiResponse<Res>;
    const parseEndTime = Date.now();
    
    console.log("JSON parse time:", `${parseEndTime - parseStartTime}ms`);
    console.log("Response type:", typeof json);
    console.log("Response keys:", json && typeof json === 'object' ? Object.keys(json) : []);
    
    // Log response data (but be careful with large responses)
    if (json && typeof json === 'object') {
      const responseStr = JSON.stringify(json);
      if (responseStr.length > 1000) {
        console.log("Response data (truncated):", responseStr.substring(0, 1000) + "...");
        console.log("Response size:", responseStr.length, "characters");
      } else {
        console.log("Response data:", responseStr);
      }
    } else {
      console.log("Response data:", json);
    }
    
    console.log("=== RESPONSE VALIDATION ===");
    console.log("Response type field:", json.type);
    
    if (json.type === "error") {
      console.error("=== ERROR RESPONSE RECEIVED ===");
      console.error("Error message:", json.message);
      console.error("Request ID:", requestId);
      console.error("Endpoint:", endpoint);
      console.error("Request body:", JSON.stringify(body, null, 2));
      console.error("Total time:", `${Date.now() - startTime}ms`);
      throw new Error(json.message);
    }
    
    console.log("=== SUCCESS RESPONSE VALIDATION ===");
    console.log("Data field present:", 'data' in json);
    console.log("Data type:", typeof json.data);
    
    if (!json.data) {
      console.error("=== NO DATA IN RESPONSE ===");
      console.error("Response:", JSON.stringify(json, null, 2));
      console.error("Request ID:", requestId);
      console.error("Endpoint:", endpoint);
      throw new Error(`No data received from ${endpoint}`);
    }
    
    if (json.data && typeof json.data === 'object') {
      console.log("Data keys:", Object.keys(json.data));
      
      const dataStr = JSON.stringify(json.data);
      if (dataStr.length > 1000) {
        console.log("Response data (truncated):", dataStr.substring(0, 1000) + "...");
        console.log("Data size:", dataStr.length, "characters");
      } else {
        console.log("Response data:", dataStr);
      }
    } else {
      console.log("Response data:", json.data);
    }
    
    const totalTime = Date.now() - startTime;
    console.log("=== CLIENT API REQUEST SUCCESS ===");
    console.log("Total time:", `${totalTime}ms`);
    console.log("Request ID:", requestId);
    console.log("Endpoint:", endpoint);
    console.log("Success!");
    
    return json.data;
  } catch (error) {
    const totalTime = Date.now() - startTime;
    
    console.error("=== CLIENT API REQUEST ERROR ===");
    console.error("Request ID:", requestId);
    console.error("Error timestamp:", new Date().toISOString());
    console.error("Total time:", `${totalTime}ms`);
    console.error("Endpoint:", endpoint);
    console.error("Request body:", JSON.stringify(body, null, 2));
    console.error("Error type:", error?.constructor?.name);
    
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      
      if ('cause' in error) {
        console.error("Error cause:", error.cause);
      }
    }
    
    // Log fetch-specific errors
    if (error && typeof error === 'object') {
      console.error("Error object keys:", Object.keys(error));
      
      if ('name' in error) {
        console.error("Error name:", error.name);
      }
      
      if ('code' in error) {
        console.error("Error code:", error.code);
      }
      
      if ('errno' in error) {
        console.error("Error errno:", error.errno);
      }
      
      if ('syscall' in error) {
        console.error("Error syscall:", error.syscall);
      }
      
      if ('hostname' in error) {
        console.error("Error hostname:", error.hostname);
      }
    }
    
    console.error("=== END CLIENT API REQUEST ERROR ===");
    
    // Re-throw the error
    throw error;
  }
};

export const renderVideo = async ({
  id,
  inputProps,
}: {
  id: string;
  inputProps: z.infer<typeof CompositionProps>;
}) => {
  console.log("=== RENDER VIDEO FUNCTION START ===");
  console.log("Function: renderVideo");
  console.log("Timestamp:", new Date().toISOString());
  console.log("Composition ID:", id);
  
  console.log("=== INPUT PROPS ANALYSIS ===");
  console.log("Input props type:", typeof inputProps);
  console.log("Input props keys:", Object.keys(inputProps));
  console.log("Full input props:", JSON.stringify(inputProps, null, 2));
  
  if (inputProps.overlays) {
    console.log("Overlays count:", inputProps.overlays.length);
    console.log("Overlays details:", JSON.stringify(inputProps.overlays, null, 2));
  }
  
  if (inputProps.durationInFrames) {
    console.log("Duration in frames:", inputProps.durationInFrames);
    console.log("Duration in seconds:", inputProps.durationInFrames / (inputProps.fps || 30));
  }
  
  if (inputProps.width && inputProps.height) {
    console.log("Video dimensions:", `${inputProps.width}x${inputProps.height}`);
    console.log("Aspect ratio:", (inputProps.width / inputProps.height).toFixed(2));
  }
  
  if (inputProps.fps) {
    console.log("Frame rate:", inputProps.fps);
  }
  
  if (inputProps.src) {
    console.log("Source URL:", inputProps.src);
  }
  
  console.log("=== RENDER REQUEST PREPARATION ===");
  const body: z.infer<typeof RenderRequest> = {
    id,
    inputProps,
  };
  
  console.log("Request body:", JSON.stringify(body, null, 2));
  console.log("Request body size:", JSON.stringify(body).length, "characters");
  
  console.log("=== MAKING RENDER REQUEST ===");
  console.log("Endpoint: /api/latest/lambda/render");
  console.log("Calling makeRequest...");
  
  const startTime = Date.now();
  const response = await makeRequest<RenderMediaOnLambdaOutput>(
    "/api/latest/lambda/render",
    body
  );
  const endTime = Date.now();
  
  console.log("=== RENDER REQUEST COMPLETE ===");
  console.log("Total render request time:", `${endTime - startTime}ms`);
  console.log("Response type:", typeof response);
  console.log("Response keys:", response && typeof response === 'object' ? Object.keys(response) : []);
  
  if (response && typeof response === 'object') {
    const responseStr = JSON.stringify(response);
    if (responseStr.length > 1000) {
      console.log("Render response (truncated):", responseStr.substring(0, 1000) + "...");
      console.log("Response size:", responseStr.length, "characters");
    } else {
      console.log("Full render response:", responseStr);
    }
    
    if ('renderId' in response) {
      console.log("Render ID:", response.renderId);
    }
    
    if ('bucketName' in response) {
      console.log("Bucket name:", response.bucketName);
    }
    
    if ('functionName' in response) {
      console.log("Function name:", response.functionName);
    }
    
    if ('region' in response) {
      console.log("Region:", response.region);
    }
    
    if ('costs' in response && response.costs) {
      console.log("Estimated costs:", JSON.stringify(response.costs, null, 2));
    }
  }
  
  console.log("=== RENDER VIDEO FUNCTION END ===");
  console.log("Successfully initiated video render");
  return response;
};

export const getProgress = async ({
  id,
  bucketName,
}: {
  id: string;
  bucketName: string;
}) => {
  console.log("=== GET PROGRESS FUNCTION START ===");
  console.log("Function: getProgress");
  console.log("Timestamp:", new Date().toISOString());
  console.log("Render ID:", id);
  console.log("Bucket name:", bucketName);
  
  console.log("=== PROGRESS REQUEST VALIDATION ===");
  if (!id) {
    console.error("ERROR: Render ID is missing");
    throw new Error("Render ID is required");
  }
  
  if (!bucketName) {
    console.error("ERROR: Bucket name is missing");
    throw new Error("Bucket name is required");
  }
  
  console.log("Validation passed");
  console.log("Render ID length:", id.length);
  console.log("Bucket name length:", bucketName.length);
  
  console.log("=== PROGRESS REQUEST PREPARATION ===");
  const body: z.infer<typeof ProgressRequest> = {
    id,
    bucketName,
  };
  
  console.log("Request body:", JSON.stringify(body, null, 2));
  console.log("Request body type:", typeof body);
  console.log("Request body keys:", Object.keys(body));
  
  console.log("=== MAKING PROGRESS REQUEST ===");
  console.log("Endpoint: /api/latest/lambda/progress");
  console.log("Calling makeRequest...");
  
  const startTime = Date.now();
  const response = await makeRequest<ProgressResponse>(
    "/api/latest/lambda/progress",
    body
  );
  const endTime = Date.now();
  
  console.log("=== PROGRESS REQUEST COMPLETE ===");
  console.log("Total progress request time:", `${endTime - startTime}ms`);
  console.log("Response type:", typeof response);
  console.log("Response keys:", response && typeof response === 'object' ? Object.keys(response) : []);
  
  if (response && typeof response === 'object') {
    console.log("Full progress response:", JSON.stringify(response, null, 2));
    
    if ('type' in response) {
      console.log("Progress response type:", response.type);
      
      if (response.type === 'error') {
        console.error("Progress error detected:");
        console.error("Error message:", response.message);
      } else if (response.type === 'progress') {
        console.log("Progress update:");
        console.log("Progress value:", response.progress);
        console.log("Progress percentage:", `${(response.progress * 100).toFixed(2)}%`);
      } else if (response.type === 'done') {
        console.log("Render completed:");
        console.log("Output URL:", response.url);
        console.log("File size (bytes):", response.size);
        console.log("File size (MB):", response.size ? `${(response.size / (1024 * 1024)).toFixed(2)} MB` : "unknown");
      }
    }
  }
  
  console.log("=== GET PROGRESS FUNCTION END ===");
  console.log("Successfully retrieved progress information");
  return response;
};

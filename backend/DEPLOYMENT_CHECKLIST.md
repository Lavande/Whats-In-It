# 部署检查清单 - What's In It API

## 后端代码修复总结

### 1. 🔧 修复了API请求格式不匹配问题

**问题**: Analysis API端点期望两个分离的Body参数，但前端发送的是单一JSON对象

**修复**:
- 添加了新的 `ComprehensiveAnalysisRequest` 模型在 `schemas/food.py`
- 修改了 `analysis.py` 路由来接受正确的请求格式
- 更新了请求处理逻辑

### 2. 🔧 修复了用户偏好字段不匹配问题

**问题**: 前端(web)使用 `diet_types`，Flutter使用 `diet_type`，后端只支持 `diet_type`

**修复**:
- 更新了 `UserHealthProfile` 模型支持两种格式
- 添加了 `get_diet_types()` 方法来处理兼容性
- 更新了 Perplexity 服务使用新方法

### 3. ✅ 健康检查端点
- 添加了 `/health` 端点用于负载均衡器
- 改进了根路径 `/` 响应

### 4. ✅ 启动脚本
- 创建了 `start.py` 用于生产环境部署

## 部署要求

### 环境变量
确保设置以下环境变量：
```
PERPLEXITY_API_KEY=your_api_key_here
PORT=8000 (可选，默认8000)
HOST=0.0.0.0 (可选，默认0.0.0.0)
```

### 启动命令
```bash
# 开发环境
python3 main.py

# 生产环境
python3 start.py

# 或使用uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000
```

### API端点测试

#### 1. 健康检查
```bash
curl https://api.whats-in-it.org/health
# 期望响应: {"status": "healthy", "service": "What's In It API"}
```

#### 2. 产品查询
```bash
curl https://api.whats-in-it.org/api/v1/product/3168930007197
# 期望响应: 产品信息JSON
```

#### 3. 分析API (Web格式)
```bash
curl -X POST https://api.whats-in-it.org/api/v1/analyze-comprehensive \
  -H "Content-Type: application/json" \
  -d '{
    "product": {
      "barcode": "3168930007197",
      "name": "Test Product",
      "ingredients_text": "flour, sugar, salt"
    },
    "user_preferences": {
      "diet_types": ["vegetarian"],
      "allergies": ["nuts"],
      "health_conditions": []
    }
  }'
```

## 常见502错误原因

1. **应用未启动**: 确保FastAPI应用正在运行
2. **端口错误**: 确保应用监听正确端口
3. **主机绑定**: 确保绑定到 `0.0.0.0` 而不是 `127.0.0.1`
4. **依赖缺失**: 运行 `pip install -r requirements.txt`
5. **环境变量**: 确保 `PERPLEXITY_API_KEY` 已设置
6. **代理配置**: 检查反向代理(如nginx)配置

## 测试步骤

1. ✅ 依赖安装成功
2. ✅ FastAPI应用可以导入
3. ⏳ 需要测试实际HTTP服务器启动
4. ⏳ 需要测试API端点响应
5. ⏳ 需要验证CORS设置
6. ⏳ 需要测试前端连接

## 下一步

1. 启动服务器: `python3 start.py`
2. 测试健康检查端点
3. 测试产品API
4. 测试分析API
5. 验证前端连接
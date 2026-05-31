module.exports = {
  tag: {
    name: "Room",
    description: "教室管理接口"
  },
  paths: {
    '/api/_organization/room/list': {
      post: {
        summary: '获取教室列表',
        description: '获取教室列表信息，需要相应权限',
        parameters: [
          {
            name: 'filter',
            in: 'query',
            description: '筛选条件',
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string', description: '教室名称' },
                capacity: { type: 'number', description: '容量' },
                location: { type: 'string', description: '位置' },
                status: { type: 'string', description: '状态' },
                isActive: { type: 'boolean', description: '是否激活' }
              }
            }
          }
        ],
        responses: {
          200: {
            description: '成功获取教室列表',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    code: { type: 'number' },
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: {
                      type: 'object',
                      properties: {
                        total: { type: 'number' },
                        items: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Room' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/_organization/room/detail/{id}': {
      post: {
        summary: '获取教室详情',
        description: '获取指定教室的详细信息',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: '教室ID',
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: {
            description: '成功获取教室详情',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    code: { type: 'number' },
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: {
                      type: 'object',
                      properties: {
                        item: { $ref: '#/components/schemas/Room' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/_organization/room/add': {
      post: {
        summary: '创建教室',
        description: '创建新的教室信息',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', description: '教室名称' },
                  capacity: { type: 'number', description: '容量' },
                  location: { type: 'string', description: '位置' },
                  description: { type: 'string', description: '描述' },
                  status: { type: 'string', description: '状态' },
                  isActive: { type: 'boolean', description: '是否激活' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: '成功创建教室',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    code: { type: 'number' },
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: {
                      type: 'object',
                      properties: {
                        item: { $ref: '#/components/schemas/Room' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/_organization/room/edit/{id}': {
      post: {
        summary: '更新教室信息',
        description: '更新指定教室的信息',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: '教室ID',
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: '教室名称' },
                  capacity: { type: 'number', description: '容量' },
                  location: { type: 'string', description: '位置' },
                  description: { type: 'string', description: '描述' },
                  status: { type: 'string', description: '状态' },
                  isActive: { type: 'boolean', description: '是否激活' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: '成功更新教室信息',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    code: { type: 'number' },
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: {
                      type: 'object',
                      properties: {
                        item: { $ref: '#/components/schemas/Room' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Room: {
        type: 'object',
        properties: {
          _id: { type: 'string', description: '教室ID' },
          name: { type: 'string', description: '教室名称' },
          capacity: { type: 'number', description: '容量' },
          location: { type: 'string', description: '位置' },
          description: { type: 'string', description: '描述' },
          status: { type: 'string', description: '状态' },
          isActive: { type: 'boolean', description: '是否激活' },
          Org: { type: 'string', description: '机构ID' },
          createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
          updatedAt: { type: 'string', format: 'date-time', description: '更新时间' }
        }
      }
    }
  }
};
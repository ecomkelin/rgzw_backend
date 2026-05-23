/** 删除前端不可变字段, 让前端无法修改, 模型中 标注 immutableFront属性为 true 的字段 */
exports.deleteImmutableFront = (doc, docModel) => {
    delete doc._id;
    for (const key in docModel) {
        const field = docModel[key];
        if (field.immutableFront === true) delete doc[key]
    }
    return doc;
}
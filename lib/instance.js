FinePicker = new FinePickerImp();
WebApp.rawConnectHandlers.use(function(req, res, next) {
  FinePicker._dispatch(req, res, next);
});
